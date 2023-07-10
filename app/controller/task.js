"use strict";

const { Controller } = require("egg");

class TaskController extends Controller {
	async index() {
		const { ctx } = this;
		ctx.body = "hi, egg";
	}

	async query() {
		const { ctx, service } = this;
		const result = await service.task.getTasksByQuery(ctx.request.body);

		return ctx.sendSuccess(result);
	}

	async update() {
		const { ctx, service } = this;
		const result = await service.task.updateTask(ctx.query);
		return ctx.sendSuccess(result);
	}

	async add() {
		const { ctx, service } = this;
		const result = await service.task.addTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async delete() {
		const { ctx, service } = this;
		const result = await service.task.deleteTask(ctx.query);
		return ctx.sendSuccess(result);
	}
}

module.exports = TaskController;
