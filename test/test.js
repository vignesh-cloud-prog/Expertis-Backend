const express = require("express");
const chai = require("chai");
const request = require("supertest");
const app = require('../index.js');
describe("Api should be working", () => {
  it("should respond api is working", (done) => {
    request(app)
      .get("/")
      .expect(200)
      .then((res) => {
        // console.log(res);
        chai.expect(res.text).to.equal('API Working!!')
        done();
        // more validations can be added here as required
      });
   
  });
});
