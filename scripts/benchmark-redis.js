/**
 * Redis Cache Benchmark Script
 * 
 * Measures response times for key API endpoints WITH and WITHOUT Redis cache.
 * Produces a comparison report showing the performance improvement.
 * 
 * Usage:
 *   1. Start the server: npm run server
 *   2. Login and get a JWT token
 *   3. Run: node scripts/benchmark-redis.js <JWT_TOKEN>
 * 
 * The script will:
 *   - Hit each endpoint twice (1st = MISS, 2nd = HIT)
 *   - Display before/after latency comparison
 *   - Generate a markdown report in reports/redis-benchmark.md
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3001";
const TOKEN = process.argv[2];

if (!TOKEN) {
  console.error("❌ Usage: node scripts/benchmark-redis.js <JWT_TOKEN>");
  console.error("   Get a token by logging in via /api/auth/login");
  process.exit(1);
}

const ENDPOINTS = [
  { name: "Account Summary", path: "/api/account-summary", cached: true },
  { name: "Credit Score", path: "/api/credit-score/me", cached: true },
  { name: "Spendings (Weekly)", path: "/api/spendings/weekly", cached: true },
  { name: "Spendings (Distribution)", path: "/api/spendings/distribution-pie", cached: true },
  { name: "User Investments", path: "/api/investments/user-investments", cached: true },
  { name: "Investment History", path: "/api/investments/investment-history?range=6M", cached: true },
  { name: "Public Blogs", path: "/api/blogs", cached: true },
];

function makeRequest(urlPath) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    const url = new URL(urlPath, BASE_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        resolve({
          statusCode: res.statusCode,
          cacheStatus: res.headers["x-cache"] || "N/A",
          durationMs: Math.round(durationMs * 100) / 100,
          dataSize: data.length,
        });
      });
    });

    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
    req.end();
  });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function benchmark() {
  console.log("🚀 Redis Cache Benchmark");
  console.log("========================\n");

  const results = [];

  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`📊 Testing: ${endpoint.name}...`);

    try {
      // Request 1: Cache MISS (first hit)
      const miss = await makeRequest(endpoint.path);
      await sleep(100); // small gap

      // Request 2: Cache HIT (second hit)
      const hit = await makeRequest(endpoint.path);

      const improvement =
        miss.durationMs > 0
          ? Math.round(((miss.durationMs - hit.durationMs) / miss.durationMs) * 100)
          : 0;

      results.push({
        name: endpoint.name,
        path: endpoint.path,
        missMs: miss.durationMs,
        hitMs: hit.durationMs,
        missStatus: miss.cacheStatus,
        hitStatus: hit.cacheStatus,
        statusCode: miss.statusCode,
        improvement: improvement,
        dataSize: miss.dataSize,
      });

      console.log(
        ` ${miss.statusCode === 200 ? "✅" : "⚠️ "} ${miss.durationMs}ms → ${hit.durationMs}ms (${improvement > 0 ? "+" : ""}${improvement}% faster)`
      );
    } catch (err) {
      console.log(` ❌ Error: ${err.message}`);
      results.push({
        name: endpoint.name,
        path: endpoint.path,
        missMs: "ERR",
        hitMs: "ERR",
        missStatus: "ERR",
        hitStatus: "ERR",
        statusCode: "ERR",
        improvement: "N/A",
        dataSize: 0,
      });
    }
  }

  // Calculate averages
  const validResults = results.filter((r) => typeof r.missMs === "number" && typeof r.hitMs === "number");
  const avgMiss = validResults.length
    ? Math.round(validResults.reduce((s, r) => s + r.missMs, 0) / validResults.length)
    : 0;
  const avgHit = validResults.length
    ? Math.round(validResults.reduce((s, r) => s + r.hitMs, 0) / validResults.length)
    : 0;
  const avgImprovement = avgMiss > 0 ? Math.round(((avgMiss - avgHit) / avgMiss) * 100) : 0;

  // Print summary
  console.log("\n📈 Summary");
  console.log("==========");
  console.log(`Average without cache: ${avgMiss}ms`);
  console.log(`Average with cache:    ${avgHit}ms`);
  console.log(`Average improvement:   ${avgImprovement}%\n`);

  // Generate markdown report
  const report = generateReport(results, avgMiss, avgHit, avgImprovement);
  const reportsDir = path.join(__dirname, "..", "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, "redis-benchmark.md");
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Report saved to: ${reportPath}`);
}

function generateReport(results, avgMiss, avgHit, avgImprovement) {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

  let md = `# 🚀 Redis Cache Performance Report

> Generated: ${timestamp}
> Server: ${BASE_URL}
> Cache Backend: Redis (ioredis)

## Summary

| Metric | Value |
|--------|-------|
| **Endpoints Tested** | ${results.length} |
| **Avg Response (No Cache)** | ${avgMiss}ms |
| **Avg Response (Cached)** | ${avgHit}ms |
| **Avg Improvement** | **${avgImprovement}%** |

## Detailed Results

| Endpoint | Without Cache | With Cache | Improvement | Status |
|----------|--------------|------------|-------------|--------|
`;

  for (const r of results) {
    const imp = typeof r.improvement === "number" ? `${r.improvement}%` : r.improvement;
    md += `| ${r.name} | ${r.missMs}ms | ${r.hitMs}ms | **${imp}** | ${r.statusCode} |\n`;
  }

  md += `
## How It Works

1. **Cache MISS (1st request)**: Request hits MongoDB, result is stored in Redis with a TTL
2. **Cache HIT (2nd request)**: Request is served directly from Redis, no DB query

### Cached Endpoints & TTL

| Endpoint | TTL |
|----------|-----|
| Public Blogs (\`/api/blogs\`) | 120s |
| Account Summary (\`/api/account-summary\`) | 180s |
| Credit Score (\`/api/credit-score/me\`) | 300s |
| Weekly Spendings (\`/api/spendings/weekly\`) | 60s |
| Expense Distribution (\`/api/spendings/distribution-pie\`) | 60s |
| User Investments (\`/api/investments/user-investments\`) | 60s |
| Investment History (\`/api/investments/investment-history\`) | 90s |

### Implementation Details

- **Library**: \`ioredis\` connected to Redis Cloud (ap-south-1)
- **Cache Key Format**: \`cache:{url}:{userId}\` (per-user isolation)
- **Headers**: \`X-Cache: HIT\` or \`X-Cache: MISS\` for observability
- **Graceful Degradation**: If Redis is unavailable, requests bypass cache and hit DB directly
- **Invalidation**: Cache entries auto-expire via TTL; manual invalidation available via \`invalidateCache()\`

---

*Report generated by \`scripts/benchmark-redis.js\`*
`;

  return md;
}

benchmark().catch(console.error);
