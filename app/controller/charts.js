"use strict";

const { Controller } = require("egg");

class ChartsController extends Controller {
	async getPieChart() {
		const { ctx, service } = this;
		try {
			const result = await service.charts.getPieCharts(ctx.request.body);
			return ctx.sendSuccess(result);
		} catch (e) {
			return ctx.sendError(e);
		}
	}

	async getSectionTaskSort() {
		const { ctx, service } = this;
		try {
			const result = await service.charts.getSectionTaskSort(ctx.request.body);
			return ctx.sendSuccess(result);
		} catch (e) {
			return ctx.sendError(e);
		}
	}

	async getFinishProcess() {
		const { ctx, service } = this;
		try {
			const result = await service.charts.getFinishProcess(ctx.request.body);
			return ctx.sendSuccess(result);
		} catch (e) {
			return ctx.sendError(e);
		}
	}
}

module.exports = ChartsController;
