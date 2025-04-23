import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { Request } from "express";
import { hbs2 } from "../index.ts";

interface detOb extends newDevType {
  type?: string;
  url?: string;
  url2?: string;
  image?: string;
  name?: string;
  email: string;
  token?: string;
  Cemail?: string;
  fullname?: string;
  privilege?: string;
  title?: string;
  message?: string;
  password?: string;
  subject?: string;
  keyword?: string;
  btnText?: string;
}

export let EmailGmail = async (details: detOb, req?: Request) => {
  let newDir = __dirname
    ?.replace(`\\Middlewares`, "")
    ?.replace(`\/Middlewares`, "");
  console.log({ newDir, dir: __dirname, image: details?.image });

  // Open template file
  var source = fs.readFileSync(
    path.join(
      newDir,
      `views/screens/${
        details?.type === "login"
          ? "maillogin.hbs"
          : details?.type === "login_user"
          ? "mailloginuser.hbs"
          : details?.type === "notification"
          ? "notification.hbs"
          : details?.type === "admin"
          ? "mailverifyadmin.hbs"
          : details?.type === "reset"
          ? "resetpassword.hbs"
          : details?.type === "feedback"
          ? "feedback.hbs"
          : details?.type === "2fa"
          ? "is2fa.hbs"
          : details?.type === "report"
          ? "report.hbs"
          : "mailverify.hbs"
      }`
    ),
    "utf8"
  );

  // Create email generator
  var template = hbs2.handlebars.compile(source, { noEscape: true });
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const htmlToSend = template({
    url: details?.url,
    url2: details?.url2,
    btnText: details?.btnText,
    image:
      details?.image ||
      `http${req?.headers?.host?.includes("localhost") ? "" : "s"}://${
        req?.headers?.host
      }/Alloy.png`,
    name: details?.name,
    token: details?.token,
    keyword: details?.keyword,
    email: details?.email,
    Cemail: details?.Cemail,
    fullname: details?.fullname,
    privilege: details?.privilege,
    title: details?.title,
    message: details?.message,
    password: details?.password,
    account: process?.env.ACCOUNT_NAME || "Alloy Steel",
  });

  // send mail with defined transport object
  let mailer = await transporter.sendMail({
    from: `${process?.env.ACCOUNT_NAME || "Alloy Steel"}: ${
      process.env.MAIL_USER
    }`, // sender address
    to: [details.email], // list of receivers
    subject: details?.subject, // Subject line
    html: htmlToSend, // html body
  });

  console.log({ mailer });
};

export type newDevType = {
  type?: string;
  subject?: string;
  fullname?: string;
  registrar?: string;
  email: string;
  url?: string;
  url2?: string;
  password?: string;
  token?: string;
  privilege?: string;
  btnText?: string;
  message?: string;
  keyword?: string;
  image?: string;
  Cemail?: string;
};

export let mailProcessUser = async (newDev: newDevType) => {
  let mailT = ``;

  let details = {
    subject: newDev?.subject,
    fullname: newDev?.fullname,
    registrar: newDev?.registrar,
    email: newDev?.email,
    url: newDev?.url || mailT,
    url2: newDev?.url2,
    type: newDev?.type,
    password: newDev?.password,
    token: newDev?.token,
    privilege: newDev?.privilege || "",
    btnText: newDev?.btnText,
    keyword: newDev?.keyword,
    image: newDev?.image,
    message: newDev?.message,
    Cemail: newDev?.Cemail,
  };

  await EmailGmail(details);
};

export const MailReprocess = async (data: newDevType) => {
  try {
    var mailSend = await mailProcessUser(data);

    if (typeof mailSend !== "undefined") {
      mailSend = await MailReprocess(data);
    }
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) message = error.message;
    console.log({ err: message });
    if (error) {
      mailSend = await MailReprocess(data);
    }
  }
};

export const newUrlFunction = (
  req: Request,
  nextScreen?: string,
  prefix?: string
): string => {
  let newUrl = nextScreen || "",
    referer,
    origin;
  if (req?.header("referer")) referer = req?.header("referer");
  if (req?.header("origin")) origin = req?.header("origin");

  if (nextScreen)
    if (req?.header("referer") && nextScreen?.includes(referer)) {
      newUrl = nextScreen;
      console.log("hi referer");
    } else if (req?.header("origin") && nextScreen?.includes(origin)) {
      newUrl = nextScreen;
      console.log("hi origin");
    } else if (
      process.env.DASHBOARD_ENDPOINT &&
      nextScreen?.includes(process?.env?.DASHBOARD_ENDPOINT)
    ) {
      newUrl = nextScreen;
      console.log("hi env inc");
    } else if (
      process.env.DASHBOARD_ENDPOINT &&
      !nextScreen?.startsWith("http")
    ) {
      newUrl = `${process.env.DASHBOARD_ENDPOINT}/${nextScreen || ""}`;
      console.log("hi env");
    } else newUrl = nextScreen;
  else if (req?.header("referer")) {
    newUrl = `${req?.header("referer")}/${nextScreen || ""}`;
    console.log("hi not next referer");
  } else if (req?.header("origin")) {
    newUrl = `${req?.header("origin")}/${nextScreen || ""}`;
    console.log("hi not next origin");
  } else if (process.env.DASHBOARD_ENDPOINT) {
    newUrl = `${process.env.DASHBOARD_ENDPOINT}/${nextScreen || ""}`;
    console.log("hi not next env");
  }
  console.log({ nextScreen, newUrl });
  if (prefix) {
    if (newUrl?.startsWith("http://"))
      newUrl = newUrl?.replace("http://", `http://${prefix}.`);
    if (newUrl?.startsWith("https://"))
      newUrl = newUrl?.replace("https://", `https://${prefix}.`);
  }

  console.log({
    head: req?.headers,
    host: req.header("host"),
    origin: req.header("origin"),
    referer: req.header("referer"),
    nextScreen,
    newUrl,
  });

  return newUrl;
};

export const hbsUrl = (
  url?: string,
  btnText?: string,
  color?: string,
  title?: string
) => {
  if (url) {
    return !btnText
      ? `<p>${title || "Admin url"}</p>
		<p>
			${url}
		</p>`
      : `<p>
			<a
				href=${url}
				class="btn btn-success text-decoration-none"
				style="background-color: ${
          color || "#2658AB"
        }; padding: 5px 10px; color: white; text-decoration:none; text-transform:capitalize"
			>${btnText}</a>
		</p>
		<p>or copy and paste the following into your browser</p>
		<p>
			${url}
		</p>`;
  }
};
