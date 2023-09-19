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
		const result = await service.task.updateTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async add() {
		const { ctx, service } = this;
		const result = await service.task.addTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async delete() {
		const { ctx, service } = this;
		const result = await service.task.deleteTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async setFinish() {
		const { ctx, service } = this;
		const result = await service.task.finishTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async detail() {
		const { ctx, service } = this;
		try {
			const result = await service.task.detail(ctx.request.body);
			return ctx.sendSuccess(result);
		} catch (err) {
			return ctx.sendError("未查到该记录");
		}
	}

	async appeal() {
		const { ctx, service } = this;
		const result = await service.task.appeal(ctx.request.body);
		return ctx.sendSuccess(result);
	}
	async myTask() {
		const { ctx, service } = this;
		const result = await service.task.queryMyTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async addChildTask() {
		const { ctx, service } = this;
		const result = await service.task.addChildTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async updateSubTask() {
		const { ctx, service } = this;
		const result = await service.task.updateSubTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async deleteSubTask() {
		const { ctx, service } = this;
		const result = await service.task.deleteSubTask(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async addBatchTasks() {
		const { ctx, service } = this;
		const result = await service.task.addBatchTasks(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async setFocus() {
		const { ctx, service } = this;
		const result = await service.task.setFocus(ctx.request.body);
		return ctx.sendSuccess(result);
	}

	async getFocusList() {
		const { ctx, service } = this;
		const result = await service.task.getFocusList(ctx.request.body);
		return ctx.sendSuccess(result);
	}
}

module.exports = TaskController;
