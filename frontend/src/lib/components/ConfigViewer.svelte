<script>
    export let configUrl;
    let config = {};
  
    async function fetchConfig() {
      const res = await fetch(configUrl);
      config = await res.json();
    }
  
    fetchConfig();
  </script>
  
  <pre>{JSON.stringify(config, null, 2)}</pre>
  