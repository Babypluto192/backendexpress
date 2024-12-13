import request from "supertest";
import { app } from "../../src/app";
import { createBookModel } from "../../src/models/createBookModel";
import { updateBookModel } from "../../src/models/updateBookModel";
import { bookViewModel } from "../../src/models/bookViewModel";
import { closeDbConnection, runDb, userModel } from "../../src/db";
import { testRepository } from "../../src/repositories/test-repository-db";
import { bookDb } from "../../src/types/dbTypes";
import { expect, test, beforeAll, afterAll } from "@jest/globals";

const Repository = new testRepository();
describe("book testing", () => {
  let bookInitial: bookDb[];

  beforeAll(async () => {
    await runDb(); 
    bookInitial = await Repository.findInitial();
  });

  afterAll(async () => {
    await closeDbConnection(); 
  });

  it("GET / + not existing id should return 404", async () => {
    await request(app).get("/book/-1000").expect(404);
  });

  it("GET / should return initial book array", async () => {
    const response = await request(app).get("/book/").expect(200);
    expect(response.body).toEqual(bookInitial);
  });

  it("POST / should return 400 if body is invalid", async () => {
    const invalidData: createBookModel[] = [{ title: "" }, { title: "   " }];
    await Promise.all(
      invalidData.map((data) => request(app).post("/book").send(data).expect(400))
    );
  });

  let createdObject1: bookViewModel;
  it("POST / should create a new book", async () => {
    const data: createBookModel = { title: "New Book" };
    const res = await request(app).post("/book").send(data).expect(201);
    createdObject1 = res.body;

    expect(createdObject1).toEqual({
      id: expect.any(Number),
      title: data.title,
    });
  });

  it("GET / + existing id should return 200 + object", async () => {
    await request(app).get(`/book/${createdObject1.id}`).expect(200, createdObject1);
  });

  let createdObject2: bookViewModel;
  it("POST / should create another book", async () => {
    const data: createBookModel = { title: "Another Book" };
    const res = await request(app).post("/book").send(data).expect(201);
    createdObject2 = res.body;

    expect(createdObject2).toEqual({
      id: expect.any(Number),
      title: data.title,
    });
  });

  it("PUT / should return 404 if id doesn't exist", async () => {
    const data: updateBookModel = { title: "Updated Title" };
    await request(app).put("/book/99999").send(data).expect(404);
  });

  it("PUT / should return 400 if title is invalid", async () => {
    const invalidData: updateBookModel[] = [{ title: "" }, { title: "    " }];
    await Promise.all(
      invalidData.map((data) => request(app).put(`/book/${createdObject1.id}`).send(data).expect(400))
    );
  });

  it("PUT / should update book and return 204", async () => {
    const data: updateBookModel = { title: "Updated Book" };
    const res = await request(app).put(`/book/${createdObject1.id}`).send(data).expect(201);
    createdObject1 = res.body;

    expect(createdObject1).toEqual({
      id: createdObject1.id,
      title: data.title,
    });
  });

  it("DELETE / should return 404 if object does not exist", async () => {
    await request(app).delete("/book/9999").expect(404);
  });

  it("DELETE / should delete object and return 204", async () => {
    await request(app).delete(`/book/${createdObject1.id}`).expect(204);

    const response = await request(app).get("/book").expect(200);
    expect(response.body).toEqual([...bookInitial, createdObject2]);
  });

  it("GET / should return 400 on invalid filter parameters", async () => {
    await request(app).get("/book?sortField=&sortOrder=asc").expect(400);
  });
});

describe("user testing", () => {
 
  beforeAll(async () => {
    await runDb(); 
  });

  afterAll(async () => {
    await userModel.deleteMany({ login : "testUser"})  
    await closeDbConnection(); 
  });

  it("register wrong email should return 400", async () => {
    await request(app).post("/register/").send(
       {
        "email": "not email",
        "login": "testUser",
        "password": "12345"
    }
    ).expect(400);
  });
   it("register empty email should return 400", async () => {
    await request(app).post("/register/").send(
       {
        "email": "     ",
        "login": "testUser",
        "password": "12345"
    }
    ).expect(400);
  });
  it("register empty login should return 400", async () => {
    await request(app).post("/register/").send(
      {
        "email": "test@mail.ru",
        "login": "    ",
        "password": "12345"
      }     
    ).expect(400);
  });
  it("register login under 3 symbols should return 400", async () => {
    await request(app).post("/register/").send(
       {
        "email": "test@mail.ru",
        "login": "ab",
        "password": "12345"
      }
    ).expect(400);
  });
  it("register password empty should return 400", async () => {
    await request(app).post("/register/").send(
       {
        "email": "test@mail.ru",
        "login": "testUser",
        "password": "   "
      }
    ).expect(400);
  });

  it("register should return 201", async () => {
    await request(app).post("/register/").send(
       {
        "email": "eh3ehjkae@gmail.com",
        "login": "testUser",
        "password": "12345"
    }
    ).expect(201);
  });

  it("login  empty email and login should return 400", async () => {
    await request(app).post("/login").send(
       {
        "email": "",
        "login": "",
        "password": "12345"
      }
    ).expect(400);
  });

  it("login to not confirmed account should return 401", async () => {
    await request(app).post("/login").send(
       {
        "login": "testUser",
        "password": "12345"
    }
    ).expect(401);
  });
  let accessToken: string;
  let refreshToken:string;
  let deviceId: string;
  it("login to real account should return 201", async () => {
    const response = await request(app).post("/login").send(
       {
        "login": "testUserConfirmed",
        "password": "12345"
    }
    ).expect(201);
    const cookies = response.headers['set-cookie'] as unknown as string[]
  
    refreshToken = cookies?.find((cookie: string) => cookie.startsWith('refreshToken=')) || '';
    deviceId = cookies?.find((cookie: string) => cookie.startsWith('deviceId=')) || '';

    deviceId = deviceId.split(';')[0].replace('deviceId=', '');
    refreshToken = refreshToken.split(';')[0].replace('refreshToken=', '');
    accessToken = response.headers['authorization'];
   
  });

    it("login with no jwt should return 401", async () => {
    await request(app).get("/specialloggeddata")
    .set('Authorization', ``)
    .expect(401);
  });
  it("login with wrong jwt should return 401", async () => {
    await request(app).get("/specialloggeddata")
    .set('Authorization', `Bearer ${accessToken + 'a'}` )
    .expect(401);
  });
  it("login with JWT should return 200", async () => {
    await request(app).get("/specialloggeddata")
    .set('Authorization', `Bearer ${accessToken}` )
    .expect(200);
  });

   it("refresh refrshToken is not valid should return 400", async () => {
    await request(app).get("/refresh")
    .set('Cookie', 'a' + refreshToken +'bbb' )
    .expect(401);

  });

   it("refresh if refrshToken empty should return 401", async () => {
    await request(app).get("/refresh")
    .set('Cookie', "")
    .expect(401);

  });
  it("refresh if refrshToken not provided should return 400", async () => {
    await request(app).get("/refresh").expect(401);
  });

  it("confirmation if confirmation code not provided should return 400", async () => {
    await request(app).get("/confirmation")
    .expect(400);
  });

  it("recovery if mail not right should return 404", async () => {
    await request(app).post("/recovery").send( {
      "email": "aaa"
    })
    .expect(400);
    
  });


  it("recovery if user not confirmed  should return 401", async () => {
    await request(app).post("/recovery").send(
       {
      "email": "eh3ehjkae@gmail.com"
    }
    )
    .expect(401);

    
  });

});
