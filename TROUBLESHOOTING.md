# Troubleshooting Guide

## Vercel Deployment Errors

### Error: Function Runtimes must have a valid version

**Error Message:**
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

**Cause:**
The `vercel.json` file contains a `functions` configuration with an invalid runtime format. Vercel doesn't recognize runtime specifications like `nodejs20.x` in the functions configuration for TypeScript/JavaScript files.

**Solution:**
Remove the `functions` configuration from `vercel.json`. Vercel automatically detects and handles TypeScript/JavaScript files in the `api` directory as serverless functions without explicit runtime configuration.

**Before:**
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

**After:**
Simply remove the `functions` section entirely. Vercel will auto-detect Node.js functions based on your project configuration.

**Note:** Vercel automatically uses the appropriate Node.js runtime version based on your project's Node.js version specification (e.g., in `package.json` or `.nvmrc`).

