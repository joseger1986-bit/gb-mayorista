(function () {
  const config = window.GB_SUPABASE_CONFIG || {};
  const sdkFactory = window.supabase?.createClient;

  if (!config.url || !config.publishableKey) {
    window.gbSupabase = null;
    window.gbSupabaseStatus = {
      connected: false,
      reason: "missing-config"
    };
    document.documentElement.dataset.gbSupabase = "missing-config";
    return;
  }

  if (typeof sdkFactory === "function") {
    window.gbSupabase = sdkFactory(config.url, config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    window.gbSupabaseStatus = {
      connected: true,
      mode: "supabase-js",
      url: config.url
    };
    document.documentElement.dataset.gbSupabase = "supabase-js";
  } else {
    window.gbSupabase = createRestSupabaseClient(config);
    window.gbSupabaseStatus = {
      connected: true,
      mode: "rest-fallback",
      url: config.url
    };
    document.documentElement.dataset.gbSupabase = "rest-fallback";
  }

  window.gbSupabaseCheck = async function () {
    if (!window.gbSupabase) {
      return {
        ok: false,
        message: "Supabase no esta configurado."
      };
    }

    const { data, error } = await window.gbSupabase
      .from("categories")
      .select("id, name")
      .limit(1);

    if (error) {
      return {
        ok: false,
        message: error.message,
        code: error.code || null,
        hint: "Si el error es de permisos, la conexion existe pero falta iniciar sesion o ajustar politicas RLS."
      };
    }

    return {
      ok: true,
      message: "Conexion correcta con Supabase.",
      sample: data
    };
  };

  function createRestSupabaseClient({ url, publishableKey }) {
    const cleanUrl = url.replace(/\/$/, "");
    const headers = {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`
    };

    return {
      from(table) {
        return new RestQueryBuilder(cleanUrl, headers, table);
      },
      storage: {
        from(bucket) {
          return {
            async upload(path, file, options = {}) {
              const uploadUrl = `${cleanUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`;
              return request(uploadUrl, {
                method: "POST",
                headers: {
                  ...headers,
                  "Content-Type": options.contentType || file.type || "application/octet-stream",
                  "x-upsert": options.upsert ? "true" : "false",
                  ...(options.cacheControl ? { "Cache-Control": `max-age=${options.cacheControl}` } : {})
                },
                body: file
              });
            },
            getPublicUrl(path) {
              return {
                data: {
                  publicUrl: `${cleanUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`
                }
              };
            }
          };
        }
      }
    };
  }

  class RestQueryBuilder {
    constructor(baseUrl, headers, table) {
      this.baseUrl = baseUrl;
      this.headers = headers;
      this.table = table;
      this.method = "GET";
      this.body = null;
      this.params = new URLSearchParams();
      this.extraHeaders = {};
    }

    select(columns = "*") {
      this.params.set("select", columns);
      if (this.method !== "GET") {
        this.extraHeaders.Prefer = mergePrefer(this.extraHeaders.Prefer, "return=representation");
      }
      return this;
    }

    order(column, options = {}) {
      this.params.append("order", `${column}.${options.ascending === false ? "desc" : "asc"}`);
      return this;
    }

    limit(value) {
      this.params.set("limit", String(value));
      return this;
    }

    upsert(rows, options = {}) {
      this.method = "POST";
      this.body = rows;
      this.extraHeaders.Prefer = mergePrefer(this.extraHeaders.Prefer, "resolution=merge-duplicates");
      if (options.onConflict) this.params.set("on_conflict", options.onConflict);
      return this;
    }

    insert(rows) {
      this.method = "POST";
      this.body = rows;
      this.extraHeaders.Prefer = mergePrefer(this.extraHeaders.Prefer, "return=representation");
      return this;
    }

    delete() {
      this.method = "DELETE";
      return this;
    }

    in(column, values) {
      const safeValues = (values || []).map((value) => String(value).replace(/[(),]/g, ""));
      this.params.set(column, `in.(${safeValues.join(",")})`);
      return this;
    }

    then(resolve, reject) {
      return this.execute().then(resolve, reject);
    }

    catch(reject) {
      return this.execute().catch(reject);
    }

    finally(callback) {
      return this.execute().finally(callback);
    }

    execute() {
      const query = this.params.toString();
      const endpoint = `${this.baseUrl}/rest/v1/${encodeURIComponent(this.table)}${query ? `?${query}` : ""}`;
      return request(endpoint, {
        method: this.method,
        headers: {
          ...this.headers,
          ...this.extraHeaders,
          "Content-Type": "application/json"
        },
        body: this.body == null ? null : JSON.stringify(this.body)
      });
    }
  }

  function mergePrefer(current, next) {
    return [current, next].filter(Boolean).join(",");
  }

  function request(url, options) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options.method || "GET", url, true);
      Object.entries(options.headers || {}).forEach(([key, value]) => xhr.setRequestHeader(key, value));
      xhr.onload = () => {
        const text = xhr.responseText || "";
        const payload = parseJson(text);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ data: payload, error: null });
          return;
        }
        resolve({
          data: null,
          error: {
            message: payload?.message || payload?.error_description || xhr.statusText || "Error de Supabase",
            code: payload?.code || String(xhr.status),
            details: payload?.details || null,
            hint: payload?.hint || null
          }
        });
      };
      xhr.onerror = () => {
        resolve({
          data: null,
          error: {
            message: "No se pudo conectar con Supabase.",
            code: "network_error"
          }
        });
      };
      xhr.send(options.body || null);
    });
  }

  function parseJson(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  }
})();
