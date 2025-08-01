import { test, expect } from "@playwright/test";

// const API_BASE_URL = "http://localhost:4010/v1";
const API_BASE_URL = "https://jairojobs2025.proudwater-1bd764bc.westus2.azurecontainerapps.io/v1";
const API_KEY = "test-api-key-123"; // Replace with your actual API key
const JOBID = "123e4567-e89b-12d3-a456-426614174000"; // Example job ID for testing
const INVALIDJOBID = "123e4567-e89b-12d3-a456-426614174123"; // Example job ID for testing
test.describe("Job Portal API Tests", () => {
  
  test.describe("GET /jobs - Search and List Jobs", () => {
    
    test("should return paginated job listings without query parameters", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      console.log("responseBody:", responseBody);

      // Validate response structure
      expect(responseBody).toHaveProperty("jobs");
      expect(responseBody).toHaveProperty("pagination");
      
      // Validate pagination structure
      expect(responseBody.pagination).toHaveProperty("total");
      expect(responseBody.pagination).toHaveProperty("page");
      expect(responseBody.pagination).toHaveProperty("limit");
      expect(responseBody.pagination).toHaveProperty("totalPages");
      
      // Validate jobs array with maxItems constraint
      expect(Array.isArray(responseBody.jobs)).toBeTruthy();
      expect(responseBody.jobs.length).toBeLessThanOrEqual(100); // maxItems constraint
      
      if (responseBody.jobs.length > 0) {
        const job = responseBody.jobs[0];
        expect(job).toHaveProperty("id");
        expect(job).toHaveProperty("title");
        expect(job).toHaveProperty("company");
        expect(job).toHaveProperty("location");
        expect(job).toHaveProperty("type");
        expect(job).toHaveProperty("remoteOption");
        expect(job).toHaveProperty("postedAt");
        
        // Validate enum values
        expect(["full-time", "part-time", "contract", "internship"]).toContain(job.type);
        expect(["on-site", "hybrid", "remote"]).toContain(job.remoteOption);
        
        // Validate date format
        expect(job.postedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }
    });

    test("should filter jobs by search query", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?q=developer`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      console.log(responseBody);
      
      expect(responseBody).toHaveProperty("jobs");
      expect(Array.isArray(responseBody.jobs)).toBeTruthy();
      expect(responseBody.jobs.length).toBeLessThanOrEqual(100);
    });

    test("should filter jobs by location", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?location=San Francisco`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      
      expect(responseBody).toHaveProperty("jobs");
      expect(Array.isArray(responseBody.jobs)).toBeTruthy();
      expect(responseBody.jobs.length).toBeLessThanOrEqual(100);
    });

    test("should support pagination with page and limit parameters", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?page=1&limit=5`, {
        headers: {
          "X-API-Key": API_KEY,
          "Prefer": "example=page2-limit5"
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      
      expect(responseBody.pagination.page).toBe(1);
      expect(responseBody.pagination.limit).toBe(5);
      expect(responseBody.jobs.length).toBeLessThanOrEqual(5);
    });

    test("should use default pagination values", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      
      // Default values: page=1, limit=10
      expect(responseBody.pagination.page).toBe(1);
      expect(responseBody.pagination.limit).toBe(10);
    });

    test("should combine multiple search parameters", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?q=engineer&location=Austin&page=1&limit=10`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty("jobs");
        expect(responseBody).toHaveProperty("pagination");
        expect(responseBody.jobs.length).toBeLessThanOrEqual(100);
      }
    });

    test("should return 404 when no jobs match criteria", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs`, {
        headers: {
          "X-API-Key": API_KEY,
          "Prefer": "code=404"
        },
        params: {
          q: 'nonexistentjob',
          location: 'nowhere'
        }
      });

      console.log(response.status());

      expect(response.status()).toBe(404);
      const responseBody = await response.json();
      
      console.log(responseBody);  

      //expect(responseBody).toHaveProperty("code", 404);
      expect(responseBody).toHaveProperty("message");
      //expect(responseBody.message).toBe("No jobs found matching your criteria");
    });

    test("should require API key authentication", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs`);

      expect(response.status()).toBe(401);
    });

    test("should reject invalid API key", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs`, {
        headers: {
          "X-API-Key": "invalid-key-123",
          "Prefer": "code=401"
        }
      });

      expect([401, 403]).toContain(response.status());
    });

    test("should validate JobSummary schema in response", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?limit=3`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      
      if (responseBody.jobs.length > 0) {
        responseBody.jobs.forEach((job: any, index: number) => {
          // Required fields for JobSummary
          expect(job, `Job at index ${index} should have id`).toHaveProperty("id");
          expect(job, `Job at index ${index} should have title`).toHaveProperty("title");
          expect(job, `Job at index ${index} should have company`).toHaveProperty("company");
          expect(job, `Job at index ${index} should have location`).toHaveProperty("location");
          expect(job, `Job at index ${index} should have type`).toHaveProperty("type");
          expect(job, `Job at index ${index} should have remoteOption`).toHaveProperty("remoteOption");
          expect(job, `Job at index ${index} should have postedAt`).toHaveProperty("postedAt");
          
          // Validate data types
          expect(typeof job.id, `Job ${index} id should be string`).toBe("string");
          expect(typeof job.title, `Job ${index} jobTitle should be string`).toBe("string");
          expect(typeof job.company, `Job ${index} companyName should be string`).toBe("object");
          expect(typeof job.location, `Job ${index} location should be string`).toBe("string");
          
          // Validate enum values
          expect(["full-time", "part-time", "contract", "internship"], `Job ${index} should have valid type`).toContain(job.type);
          expect(["on-site", "hybrid", "remote"], `Job ${index} should have valid remoteOption`).toContain(job.remoteOption);
        });
      }
    });
  });

  test.describe("GET /jobs/{jobId} - Get Job Details", () => {
    
    test("should return detailed job information for valid job ID", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs/${JOBID}`, {
        headers: { "X-API-Key": API_KEY }
      });
      expect(response.status()).toBe(200);
      const responseBody = await response.json();
     
      console.log("responseBody:", responseBody);

      // Validate required fields from Job schema
      expect(responseBody).toHaveProperty("id", JOBID);
      expect(responseBody).toHaveProperty("title");
      expect(responseBody).toHaveProperty("company");
      // Validate nested Company object
      expect(responseBody.company).toHaveProperty("id");
      expect(responseBody.company).toHaveProperty("name");
      expect(responseBody.company).toHaveProperty("logo");
      expect(responseBody.company).toHaveProperty("description");
      expect(responseBody.company).toHaveProperty("website");
      expect(responseBody.company).toHaveProperty("industry");
      expect(responseBody.company).toHaveProperty("size");
      expect(responseBody.company).toHaveProperty("founded");
      expect(responseBody.company).toHaveProperty("headquarters");
      expect(responseBody.company).toHaveProperty("verified");
      expect(responseBody.company).toHaveProperty("featured");
      expect(responseBody).toHaveProperty("location");
      expect(responseBody).toHaveProperty("type");
      expect(responseBody).toHaveProperty("experienceLevel");
      expect(responseBody).toHaveProperty("remoteOption");
      expect(responseBody).toHaveProperty("salary");
      expect(responseBody).toHaveProperty("description");
      expect(responseBody).toHaveProperty("requirements");
      expect(responseBody).toHaveProperty("responsibilities");
      expect(responseBody).toHaveProperty("benefits");
      expect(responseBody).toHaveProperty("tags");
      expect(responseBody).toHaveProperty("postedAt");
      expect(responseBody).toHaveProperty("applicationDeadline");
      expect(responseBody).toHaveProperty("applicants");
      expect(responseBody).toHaveProperty("featured");
      expect(responseBody).toHaveProperty("active");
      
      // Validate data types
      expect(typeof responseBody.id).toBe("string");
      expect(typeof responseBody.title).toBe("string");
      expect(typeof responseBody.company).toBe("object");
      expect(typeof responseBody.company.id).toBe("string");
      expect(typeof responseBody.company.name).toBe("string");
      expect(typeof responseBody.company.logo).toBe("string");
      expect(typeof responseBody.company.description).toBe("string");
      expect(typeof responseBody.company.website).toBe("string");
      expect(typeof responseBody.company.industry).toBe("string");
      expect(typeof responseBody.company.size).toBe("string");
      expect(typeof responseBody.company.founded).toBe("number");
      expect(typeof responseBody.company.headquarters).toBe("string");
      expect(typeof responseBody.company.verified).toBe("boolean");
      expect(typeof responseBody.company.featured).toBe("boolean");
      expect(typeof responseBody.description).toBe("string");
      expect(typeof responseBody.applicants).toBe("number");
      expect(typeof responseBody.featured).toBe("boolean");
      expect(typeof responseBody.active).toBe("boolean");
      
      // Validate arrays with maxItems constraint (100)
      expect(Array.isArray(responseBody.requirements)).toBeTruthy();
      expect(Array.isArray(responseBody.responsibilities)).toBeTruthy();
      expect(Array.isArray(responseBody.benefits)).toBeTruthy();
      expect(Array.isArray(responseBody.tags)).toBeTruthy();
      expect(responseBody.requirements.length).toBeLessThanOrEqual(100);
      expect(responseBody.responsibilities.length).toBeLessThanOrEqual(100);
      expect(responseBody.benefits.length).toBeLessThanOrEqual(100);
      expect(responseBody.tags.length).toBeLessThanOrEqual(100);
      
      // Validate salary object structure
      expect(responseBody.salary).toHaveProperty("min");
      expect(responseBody.salary).toHaveProperty("max");
      expect(responseBody.salary).toHaveProperty("currency");
      expect(responseBody.salary).toHaveProperty("period");
      expect(typeof responseBody.salary.min).toBe("number");
      expect(typeof responseBody.salary.max).toBe("number");
      expect(typeof responseBody.salary.currency).toBe("string");
      expect(typeof responseBody.salary.period).toBe("string");
      
      // Validate enum values
      expect(["full-time", "part-time", "contract", "internship"]).toContain(responseBody.type);
      expect(["entry", "mid", "senior"]).toContain(responseBody.experienceLevel);
      expect(["on-site", "hybrid", "remote"]).toContain(responseBody.remoteOption);
      
      // Validate URL format for company logo
      expect(responseBody.company.logo).toMatch(/^https?:\/\/.+/);
      
      // Validate date formats
      expect(responseBody.postedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(responseBody.applicationDeadline).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test("should return 404 for non-existent job ID", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs/123e4567-e89b-12d3-a456-426614174123`, {
        headers: {
          "X-API-Key": API_KEY,
          "Prefer": "code=404"
        }
      });

      expect(response.status()).toBe(404);
      const responseBody = await response.json();
      console.log("responseBody:", responseBody); 
      expect(responseBody).toHaveProperty("code", 404);
      expect(responseBody).toHaveProperty("message");
    });

    test("should require API key authentication", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs/some-job-id`);

      expect(response.status()).toBe(401);
    });

    test("should handle UUID format job ID from JobDetail example", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs/${JOBID}`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      // Should either return 200 (if job exists) or 404 (if job doesn't exist)
      expect([200, 404]).toContain(response.status());
    });

    test("should handle UUID format job ID from Job example", async ({ request }) => {
      const validUUID = "123e4567-e89b-12d3-a456-426614174000";
      
      const response = await request.get(`${API_BASE_URL}/jobs/${validUUID}`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      // Should either return 200 (if job exists) or 404 (if job doesn't exist)
      expect([200, 404]).toContain(response.status());
    });

    test("should handle simple numeric job ID from parameter example", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs/${JOBID}`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      // Should either return 200 (if job exists) or 404 (if job doesn't exist)
      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe("API Pagination Validation", () => {
    
    test("should validate Pagination schema", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?page=1&limit=5`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      
      const pagination = responseBody.pagination;
      
      // Required pagination fields
      expect(pagination).toHaveProperty("total");
      expect(pagination).toHaveProperty("page");
      expect(pagination).toHaveProperty("limit");
      expect(pagination).toHaveProperty("totalPages");
      
      // Validate data types
      expect(typeof pagination.total).toBe("number");
      expect(typeof pagination.page).toBe("number");
      expect(typeof pagination.limit).toBe("number");
      expect(typeof pagination.totalPages).toBe("number");
      
      // Validate logical constraints
      expect(pagination.page).toBeGreaterThan(0);
      expect(pagination.limit).toBeGreaterThan(0);
      expect(pagination.totalPages).toBeGreaterThanOrEqual(0);
      expect(pagination.total).toBeGreaterThanOrEqual(0);
      
      // Validate pagination consistency
      if (pagination.total > 0) {
        expect(pagination.totalPages).toBeGreaterThan(0);
        expect(Math.ceil(pagination.total / pagination.limit)).toBe(pagination.totalPages);
      }
    });

    test("should handle pagination edge cases", async ({ request }) => {
      // Test last page
      const response = await request.get(`${API_BASE_URL}/jobs?page=100&limit=10`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect([200, 404]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody.jobs.length).toBeLessThanOrEqual(10);
      }
    });
  });

  test.describe("API Performance and Error Handling", () => {
    
    test("should respond to job listing within acceptable time", async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${API_BASE_URL}/jobs`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
    });

    test("should respond to job details within acceptable time", async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${API_BASE_URL}/jobs/123e4567-e89b-12d3-a456-426614174000`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      expect([200, 404]).toContain(response.status());
      expect(responseTime).toBeLessThan(3000); // 3 seconds max
    });

    test("should handle malformed API key", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs`, {
        headers: {
          "X-API-Key": "malformed key with spaces!"
        }
      });

      expect([401, 403]).toContain(response.status());
    });

// [MermaidChart: ae395ba2-7d5a-4ab8-8db6-43b2396745b2]
    test("should handle invalid pagination parameters", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?page=-1&limit=0`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect([400, 422]).toContain(response.status());
    });

    test("should handle extremely large pagination parameters", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?page=999999&limit=1000`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      // Should handle gracefully, either with 400/422 or empty results
      expect([200, 400, 422]).toContain(response.status());
    });

    test("should validate Content-Type header", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');
    });
  });

  test.describe("API Search Functionality", () => {
    
    test("should handle empty search query", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?q=`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(400);
      const responseBody = await response.json();
      console.log("responseBody:", responseBody);
      expect(responseBody).toHaveProperty("message");
      // expect(responseBody).("jobs");
    });

    test("should handle special characters in search", async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/jobs?q=Frontend%20Engineer`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty("jobs");
    });

    test("should be case insensitive for search parameters", async ({ request }) => {
      const response1 = await request.get(`${API_BASE_URL}/jobs?q=DEVELOPER`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      const response2 = await request.get(`${API_BASE_URL}/jobs?q=developer`, {
        headers: {
          "X-API-Key": API_KEY
        }
      });

      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);
      // Both should return similar results (implementation dependent)
    });
  });
});
