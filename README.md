# E-commerce API

An E-commerce API that includes various technologies, tools, and real-world cases. It's made for the sake of practice.

Table of Contents:

- [Tech Stack](#tech-stack)
- [Try the API (API Reference)](#api-reference)
- [Run Locally](#run-locally)
- [App Structure](#app-structure)

## Tech Stack

**Typescript | Express | MongoDB**

Alongside:

- **Mongoose** - creates a connection between MongoDB and Node.js
- **JOI** - data validation
- **JWT** - JSON Web Token holds user claims encrypted, which can be transferred between backend and frontend
- **Bycript** - password hashing
- **Config** - manage configuration between different environments (development, production, etc...)
- **Winston** - Logging Management
- **Docker** - Make the app portable

## API Reference

Note: the first request may take more time (the first request will bring the API alive again)

You could be in one of these three states:
| Badget | Note |
| ----------------- | ------------------------------------------------------------------ |
| ![MIT License](https://img.shields.io/badge/Logged_in-00ffff) | If you embed a valid JWT in your request header, header key: `x-auth-token` |
| ![MIT License](https://img.shields.io/badge/Admin-ff00ff) | The admin role can only be set in the database directly, but I've provided an account in the Login section |
| ![MIT License](https://img.shields.io/badge/Guest-e6e6fa) | |

Base URL: https://e-commerce-api.glitch.me

### List of routes and their required role:

#### **Login** <img src="https://img.shields.io/badge/Guest-e6e6fa" alt="(Guset)">

```http
  POST /api/auth
```

| Body       | Type     | Description   |
| :--------- | :------- | :------------ |
| `email`    | `string` | **Required**. |
| `password` | `string` | **Required**. |

**Return:** JWT that you can add to the header of your requests, header key: `x-auth-token`

Already made accounts:

![MIT License](https://img.shields.io/badge/Admin-ff00ff) {
"email": "admin@gmail.com",
"password": "AdmiN11!"
}

![MIT License](https://img.shields.io/badge/Logged_in-00ffff) {
"email": "logged_in@gmail.com",
"password": "AAaa11!"
}

Alternatively, you can register yourself on your own ↓↓↓

#### **Register** <img src="https://img.shields.io/badge/Guest-e6e6fa" alt="(Guset)">

```http
  POST /api/users
```

| Parameter  | Type     | Description                                                                       |
| :--------- | :------- | :-------------------------------------------------------------------------------- |
| `name`     | `string` | **Required**.                                                                     |
| `email`    | `string` | **Required**.                                                                     |
| `password` | `string` | **Required**. 2 lowercase, 2 uppercase, 2 numbers, and 1 special character(ex: !) |

**Return:** JWT in the header of the response, you can add it to the header of your requests, header key: `x-auth-token`

#### **Get the products** <img src="https://img.shields.io/badge/Guest-e6e6fa" alt="(Guset)">

```http
  POST /api/products/get-products?pageSize=10&pageNumber=1
```

| Parameter    | Type     | Description                                           |
| :----------- | :------- | :---------------------------------------------------- |
| `name`       | `string` | **Optional**.                                         |
| `price`      | `array`  | **Optional**. [min, max]. Both values are required.   |
| `tags`       | `array`  | **Optional**.                                         |
| `categories` | `array`  | **Optional**. from: [null, "kitchen", "tech", "car"]. |

#### **Create an order** <img src="https://img.shields.io/badge/Logged_in-00ffff" alt="(Logged in)">

```http
  POST /api/orders
```

| Parameter  | Type     | Description                                                                                                                                                              |
| :--------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`   | `string` | **Optional**. One of: ["waitingDelivery", "canceled", "delivering", "delivered"].                                                                                        |
| `products` | `array`  | **Required**. An array of objects representing the ordered products. Each object requires `id` (ObjectId, required) and `orderedQuantity` (number, minimum 1, required). |

#### **Creat a product** <img src="https://img.shields.io/badge/Admin-ff00ff" alt="(Admin)">

```http
  POST /api/products
```

| Parameter  | Type     | Description                                                                                               |
| :--------- | :------- | :-------------------------------------------------------------------------------------------------------- |
| `name`     | `string` | **Required**.                                                                                             |
| `price`    | `number` | **Required**. Greater than or equal to 10.                                                                |
| `quantity` | `number` | **Required**. Must be a non-negative number.                                                              |
| `tags`     | `array`  | **Required**.                                                                                             |
| `category` | `string` | **Optional** One of [null, "kitchen", "tech", "car"].                                                     |
| `vendor`   | `object` | **Optional** object containing vendor information. Requires `name` (string, required) and `bio` (string). |

#### **Modify a product** <img src="https://img.shields.io/badge/Admin-ff00ff" alt="(Admin)">

```http
  PUT /api/products/$id
```

| Parameter  | Type      | Description                                                                                         |
| :--------- | :-------- | :-------------------------------------------------------------------------------------------------- |
| `name`     | `string`  | **Required**.                                                                                       |
| `price`    | `number`  | **Required**. greater than or equal to 10.                                                          |
| `tags`     | `array`   | **Required**.                                                                                       |
| `quantity` | `number`  | **Required**. Must be a non-negative number.                                                        |
| `category` | `string`  | **Optional**. One of [null, "kitchen", "tech", "car"].                                              |
| `isActive` | `boolean` | **Required**. Only active products can be ordered.                                                  |
| `vendor`   | `object`  | **Optional**. containing vendor information. Requires `name` (string, required) and `bio` (string). |

#### **Delete a product** <img src="https://img.shields.io/badge/Admin-ff00ff" alt="(Admin)">

```http
  DELETE /api/products/$id
```

#### **Get the orders** <img src="https://img.shields.io/badge/Admin-ff00ff" alt="(Admin)">

```http
  GET /api/orders?pageSize=10&pageNumber=1
```

#### **Get an orders** <img src="https://img.shields.io/badge/Admin-ff00ff" alt="(Admin)">

```http
  GET /api/orders/$id
```

#### **Get the users** <img src="https://img.shields.io/badge/Admin-ff00ff" alt="(Admin)">

```http
  GET /api/orders?pageSize=10&pageNumber=1
```

## Run Locally

Either by using docker or without...

#### With Docker

Make sure that Docker and Mongodb are installed...

In docker-compose.yml file replace the NODE_ENV environment variable to development instead of production

- Clone the project

```bash
  git clone https://github.com/Amer-Zakaria/e-commerce-api.git
```

- Go to the project directory

```bash
  cd e-commerce-api
```

- Build & Run the project

```bash
  docker-compose up --build
```

#### Without Docker

Make sure that you've installed NodeJS and MongoDB, then...

- Clone the project

```bash
  git clone https://github.com/Amer-Zakaria/e-commerce-api.git
```

- Go to the project directory

```bash
  cd e-commerce-api
```

- Install dependencies

```bash
  npm i
```

- Build

```bash
  npm run build
```

- Start the server

```bash
  npm start
```

## App Structure

For each set of related routes like GET/POST/PUT/DELETE product, there's:

- model file to describe the data shape and
- db helper function that handles any DB interaction logic
- middlewares for each route, like checking if the user is logged in, is admin, validating object ID present in the URL, etc
