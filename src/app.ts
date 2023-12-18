import "reflect-metadata";
import * as fs from 'fs';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { parse, stringify } from 'yaml'
import swaggerUi from "swagger-ui-express";
import { createConnection } from 'typeorm';

import PgDataSource from "./data-source";
import staffRoute from "./routes/staff";
import customerRoute from "./routes/customer";
import serviceRoute from "./routes/service";
import teamRoute from "./routes/cms/team";
import policyRoute from "./routes/cms/policy";
import faqRoute from "./routes/cms/faq";
import review_testimonyRoute from "./routes/cms/review_testimony";
import contactus_Route from "./routes/cms/contact_us";
import aboutus_Route from "./routes/cms/about_us";
import blogRoute from "./routes/cms/blog";
import careerRoute from "./routes/cms/career";
import cartRoute from "./routes/cart";
import orderRoute from "./routes/order";
import paymentRoute from "./routes/payment";
import taskRoute from "./routes/task"; 



PgDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    });
// createConnection().then(async connection => {
//     console.log("Connected to DB");
// }).catch(error => console.log(error));

const swaggerfile = fs.readFileSync("./swagger.yaml", "utf8");
const app = express();

app.use(cors({
    origin: '*'
}));
app.use(helmet());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.header('origin'));
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/payment_event', express.raw({ type: 'application/json' }));
app.use(express.json());

// // app.use(['/api-docs/v1'],
// //     nubAuth({
// //         challenge: true,
// //         users: {
// //             admin: 'p4ssw0rd',
// //         },
// //     }),
// // );
app.use("/api-docs/v1",
    swaggerUi.serve,
    swaggerUi.setup(parse(swaggerfile))
);
app.use("/api/v1", customerRoute);
app.use("/api/v1", staffRoute);
app.use("/api/v1", serviceRoute);
app.use("/api/v1", teamRoute);
app.use("/api/v1", policyRoute);
app.use("/api/v1", faqRoute);
app.use("/api/v1", review_testimonyRoute);
app.use("/api/v1", contactus_Route);
app.use("/api/v1", aboutus_Route);
app.use("/api/v1", blogRoute);
app.use("/api/v1", careerRoute);
app.use("/api/v1", cartRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", paymentRoute);
app.use("/api/v1", taskRoute);


app.get("/", (_req, res) => {
    res.status(200).send('Welcome to the TaskMann Core API...');
});

export { app };
