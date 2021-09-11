import { Router } from "https://deno.land/x/oak/mod.ts";
import { Client } from "https://deno.land/x/postgres/mod.ts";

const router = new Router();
const client = new Client({
  user: "hasan",
  database: "denoapi",
  password: "1234",
  hostname: "localhost",
  port: "5432",
});

router
  .get("/products", async ({ response }) => {
    try {
      await client.connect();
      const result = await client.queryObject("select * from products");
      response.status = 200;
      response.body = result.rows;
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  })

  .get("/products/:id", async ({ response, params }) => {
    try {
      await client.connect();
      const result = await client.queryObject(
        "select * from products where id = $1",
        params.id
      );
      response.status = 200;
      response.body = result.rows;
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  })

  .post("/products", async ({ request, response }) => {
    const body = request.body();
    const product = await body.value;
    try {
      await client.connect();
      await client.queryArray(
        "insert into products(name, description, price) values($1, $2, $3)",
        product.name,
        product.description,
        product.price
      );
      response.status = 201;
      response.body = {
        success: true,
        data: product,
      };
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  })

  .put("/products/:id", async ({ request, response, params }) => {
    const body = request.body();
    const product = await body.value;
    try {
      await client.connect();
      await client.queryArray(
        "update products set name=$1, description=$2, price=$3 where id=$4",
        product.name,
        product.description,
        product.price,
        params.id
      );
      response.status = 200;
      response.body = {
        success: true,
        data: product,
        msg: `Product with id ${params.id} has been updated`,
      };
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  })

  .delete("/products/:id", async ({ response, params }) => {
    try {
      await client.connect();
      await client.queryObject("delete from products where id = $1", params.id);
      response.status = 200;
      response.body = {
        success: true,
        msg: `Product with id ${params.id} has been deleted`,
      };
    } catch (error) {
      response.status = 500;
      response.body = {
        success: false,
        msg: error.toString(),
      };
    } finally {
      await client.end();
    }
  });

export default router;