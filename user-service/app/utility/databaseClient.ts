import { Client } from "pg";

export const DBClient = () => {
  return new Client({
    host: "ec2-15-207-114-64.ap-south-1.compute.amazonaws.com",
    // connectionString:
    //   "postgres://user_service:postgres@ec2-3-108-131-137.ap-south-1.compute.amazonaws.com:5432/user_service?sslmode=disable",
    user: "user_service",
    database: "user_service",
    password: "user_service",
    port: 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  });
};

// host: "ec2-3-108-131-137.ap-south-1.compute.amazonaws.com",
//     // connectionString:
//     //   "postgres://user_service:postgres@ec2-3-108-131-137.ap-south-1.compute.amazonaws.com:5432/user_service?sslmode=disable",
//     user: "user_service",
//     database: "user_service",
//     password: "user_service",
//     port: 5432,
//     ssl: {
//       rejectUnauthorized: false,
//     },
