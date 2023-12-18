import "reflect-metadata"
import { DataSource } from "typeorm"
import Staff from "./entities/staff"
import Customer from "./entities/customer"
import Staffverification from "./entities/staffVerification"
import Customerverification from "./entities/customerVerification";
import Service from "./entities/service";
import Subservice from "./entities/subservice";
import Pricetier from "./entities/pricetier";
import Contact from "./entities/cms/contact_us"

// console.log(__dirname + "\\entities\\**\\*.ts")
const LocalDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "taskmann",
    synchronize: true,
    logging: true,
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migration/*.ts"],
    subscribers: [],
})

const RemoteDataSource = new DataSource({
    type: "postgres",
    host: process.env.RENDER_POSTGRES_HOST,
    port: 5432,
    username: process.env.RENDER_POSTGRES_USER,
    password: process.env.RENDER_POSTGRES_PW,
    database: process.env.RENDER_POSTGRES_DB,
    synchronize: true,
    logging: false,
    entities: ["src/entities/**/*.ts"],
    migrations: [],
    subscribers: [],
})

const PgDataSource = process.env.NODE_ENV == "development" ? RemoteDataSource : LocalDataSource;
export default PgDataSource;