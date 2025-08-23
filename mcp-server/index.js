#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const server = new Server(
  {
    name: 'stakeengine-neon',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Initialize Neon connection
const sql = neon(process.env.DATABASE_URL);

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'execute_query',
        description: 'Execute a SQL query on the Neon database',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute',
            },
            params: {
              type: 'array',
              description: 'Query parameters',
              items: { type: 'string' },
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'create_user',
        description: 'Create a new user with initial balances',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            username: { type: 'string' },
            password_hash: { type: 'string' },
          },
          required: ['email', 'password_hash'],
        },
      },
      {
        name: 'get_user',
        description: 'Get user by email or ID',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
      {
        name: 'update_user_balance',
        description: 'Update user currency balance',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            currency_type: { type: 'string', enum: ['gold', 'buffalo'] },
            amount: { type: 'number' },
            operation: { type: 'string', enum: ['add', 'subtract', 'set'] },
          },
          required: ['user_id', 'currency_type', 'amount', 'operation'],
        },
      },
      {
        name: 'set_user_vault',
        description: 'Set a key-value pair in user vault',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            key: { type: 'string' },
            value: {},
          },
          required: ['user_id', 'key', 'value'],
        },
      },
      {
        name: 'get_user_vault',
        description: 'Get a value from user vault',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            key: { type: 'string' },
          },
          required: ['user_id', 'key'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'execute_query': {
        const { query, params = [] } = args;
        const result = await sql(query, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_user': {
        const { email, username, password_hash } = args;
        const userId = crypto.randomUUID();
        
        const result = await sql`
          INSERT INTO users (id, email, username, password_hash, balance, gold_coins, buffalo_coins)
          VALUES (${userId}, ${email}, ${username}, ${password_hash}, 1000.00, 1000.00, 50.00)
          RETURNING id, email, username, balance, gold_coins, buffalo_coins, created_at
        `;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result[0], null, 2),
            },
          ],
        };
      }

      case 'get_user': {
        const { email, id } = args;
        let result;
        
        if (email) {
          result = await sql`
            SELECT id, email, username, password_hash, balance, gold_coins, buffalo_coins, created_at
            FROM users WHERE email = ${email}
          `;
        } else if (id) {
          result = await sql`
            SELECT id, email, username, balance, gold_coins, buffalo_coins, created_at
            FROM users WHERE id = ${id}
          `;
        } else {
          throw new Error('Either email or id must be provided');
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result[0] || null, null, 2),
            },
          ],
        };
      }

      case 'update_user_balance': {
        const { user_id, currency_type, amount, operation } = args;
        const field = currency_type === 'gold' ? 'gold_coins' : 'buffalo_coins';
        
        let updateQuery;
        if (operation === 'set') {
          updateQuery = `UPDATE user_currency_balances SET ${field} = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *`;
        } else if (operation === 'add') {
          updateQuery = `UPDATE user_currency_balances SET ${field} = ${field} + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *`;
        } else if (operation === 'subtract') {
          updateQuery = `UPDATE user_currency_balances SET ${field} = ${field} - $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *`;
        }
        
        const result = await sql(updateQuery, [amount, user_id]);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result[0] || null, null, 2),
            },
          ],
        };
      }

      case 'set_user_vault': {
        const { user_id, key, value } = args;
        
        const result = await sql`
          INSERT INTO user_vault (user_id, key, value)
          VALUES (${user_id}, ${key}, ${JSON.stringify(value)})
          ON CONFLICT (user_id, key)
          DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result[0], null, 2),
            },
          ],
        };
      }

      case 'get_user_vault': {
        const { user_id, key } = args;
        
        const result = await sql`
          SELECT value FROM user_vault 
          WHERE user_id = ${user_id} AND key = ${key}
        `;
        
        const value = result[0] ? JSON.parse(result[0].value) : null;
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(value, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('StakeEngine Neon MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
