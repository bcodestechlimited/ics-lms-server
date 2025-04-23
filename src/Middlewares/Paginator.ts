import { PaginateModel } from "mongoose";
import { Response } from "express";
import moment from "moment";

export const Paginator = async (
	model: PaginateModel<any>,
	find: object | undefined,
	option: any
) => {
	let options = {
		...option,
		page: option?.page || 0,
		limit: option?.limit || 20,
		// allowDiskUse: true,
		pagination: option?.pagination === "not" ? false : true,
	};

	let result = await model.paginate(find, options),
		data = {
			...result,
			docsTotal: result?.docs?.length,
		};

	return data;
};

export let numberWithCommas = (x: string | number) => {
	return x?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

type errObj = {
	message: string;
	path: string;
	details?: string | string[] | object | object[];
}[];

export const ErrorResponse = (
	res: Response,
	status: number,
	message?: string | null,
	path?: string | string[] | null,
	array?: errObj | null,
	object?: object | null
) => {
	res.status(status ? status : 400).json(
		object
			? object
			: {
					message: array ? array?.[0]?.message || message : message,
					error: array ? [...array] : [{ message, path }],
			  }
	);
};

export const getUniquePasscode = (length: number, alpha?: string | null) => {
	var p = "1234567890";
	if (alpha)
		p = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	return [...Array(length ? Number(length) : 4)].reduce(
		a => a + p[~~(Math.random() * p.length)],
		""
	);
};

export type errType = { message: string; path: string }[];


export type respD = {
	message?: string;
	error?:object[]
};

export const getSerialNo = async (res:Response, category:string) => {
	try {
		let finalSerial = getUniquePasscode(3);

		if (finalSerial <= 9) {
			return `${category}|0${finalSerial}|${moment().format(
				"YYYYMMDDHHmmssASSS"
			)}_${getUniquePasscode(5, "a")?.toUpperCase()}`;
		} else {
			return `${category}|${finalSerial}|${moment().format(
				"YYYYMMDDHHmmssASSS"
			)}_${getUniquePasscode(5, "a")?.toUpperCase()}`;
		}
	} catch (error) {
		let message = "Unknown Error";
		if (error instanceof Error) message = error.message;
		console.log({ err: message });
		return res.status(500).json({
			message: `Server: ${message}`,
			error: [
				{
					message: `Server: ${message}`,
					path: "server",
				},
			],
		});
	}
};

export const checkForDuplicates = (array: any[], keyName: string): boolean => {
	return new Set(array.map(item => item[keyName])).size !== array.length;
};