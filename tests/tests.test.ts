import { describe, it, expect, afterAll, beforeAll } from "vitest";

type Method = "post" | "get" | "put" | "delete";

// Body type for all possible requests
type Body =
  | { username: string; password: string } // For register and login requests
  | { task: string } // For  create todo request
  | { completed: boolean }; // For update todo request

const baseUrl = "http://localhost:9000";

// Default user body for register and login requests
const defaultUserBody = {
  username: "testuser@email.com",
  password: "testpassword",
};

const customFetch = async (
  url: string,
  method: Method,
  body?: Body,
  token?: string
): Promise<Response> => {
  return await fetch(`${baseUrl}${url}`, {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      authorization: token ? `${token}` : "",
    },
    body: body ? JSON.stringify(body) : null,
  });
};

let token: string;

//Final test to clean up the testuser from the database
afterAll(async () => {
  const response = await customFetch(
    `/__tests__/__deleteuser__/${defaultUserBody.username}`,
    "delete"
  );
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data).toHaveProperty("message", "Test user deleted successfully");
});

// Auth Tests
describe("Authentication", () => {
  it("should not login not existing user", async () => {
    const response = await customFetch("/auth/login", "post", defaultUserBody);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty("message", "User not found");
  });

  it("should register a new user", async () => {
    const response = await customFetch(
      "/auth/register",
      "post",
      defaultUserBody
    );
    const data = await response.json();
    token = data.token;
    expect(response.status).toBe(201);
    expect(data).toHaveProperty("token");
  });

  it("should login an existing user", async () => {
    const response = await customFetch("/auth/login", "post", defaultUserBody);

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("token");
  });

  it("should not login with incorrect password", async () => {
    const response = await customFetch("/auth/login", "post", {
      username: "testuser@email.com",
      password: "wrongpassword",
    });

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toHaveProperty("message", "Password is invalid");
  });

  it("should not register a user with an existing username", async () => {
    const response = await customFetch(
      "/auth/register",
      "post",
      defaultUserBody
    );

    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toHaveProperty("message", "User already exists");
  });
});

let todoId: number;
// Todo Tests
describe("Todo", () => {
  it("should create a new todo", async () => {
    const response = await customFetch(
      "/todos",
      "post",
      {
        task: "New Task",
      },
      token
    );
    const data = await response.json();
    todoId = data.id;
    expect(response.status).toBe(201);
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("task", "New Task");
    expect(data).toHaveProperty("completed", false);
  });

  it("should get all todos", async () => {
    const response = await customFetch("/todos", "get", undefined, token);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("id");
    expect(data[0]).toHaveProperty("task");
    expect(data[0]).toHaveProperty("completed");
  });

  it("should update a todo", async () => {
    const response = await customFetch(
      `/todos/${todoId}`,
      "put",
      {
        completed: true,
      },
      token
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty("id", todoId);
    expect(data).toHaveProperty("completed", true);
  });

  it("should delete a todo", async () => {
    const response = await customFetch(
      `/todos/${todoId}`,
      "delete",
      undefined,
      token
    );
    expect(response.status).toBe(204);
  });
});

// Database cleanup before all tests
// beforeAll(async () => {
//   const response = await customFetch("/__tests__/__deleteall__", "delete");
//   const data = await response.json();

//   expect(response.status).toBe(200);
//   expect(data).toHaveProperty("message", "Database is cleaned up");
// });
