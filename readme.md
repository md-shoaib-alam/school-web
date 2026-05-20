      if (res.ok || res.status === 503) {
        
      }

      // ❌ WRONG (Hardcoded localhost)
// const res = await fetch("http://localhost:4000/health");

// ✅ CORRECT (Uses Next.js Proxy)
const res = await fetch("/api/health");