"use strict";

const { Controller } = require("egg");

class RoleController extends Controller {
	async index() {
		const { ctx } = this;
		ctx.body = "hi, egg";
	}

	async query() {}
	async update() {}

	async add() {}

	async delete() {}
}

module.exports = RoleController;
