import express, { Application, Request, Response } from "express";
import { json, urlencoded } from "body-parser";
import morgon from "morgan";
import cors from "cors";
import chalk from "chalk";
import helmet from "helmet";
import { config } from "dotenv";
import { CohortResponse, getAllCohortTokens, Token } from "./helpers";
import { isEmpty } from "lodash";
import { getTokenBalances } from "./multicall";

config({ path: ".env" });

const app: Application = express();
let log = console.log;

app.use(json({ limit: "50kb" }));
app.use(urlencoded({ extended: true }));

app.use(
  morgon((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

app.use(
  cors({
    origin: "*",
  })
);

app.use(helmet());

// application main route
// calculate TVL for all chain
app.get("/v1/unifarm/tvl", async (req: Request, res: Response) => {
  try {
    // grab all ccohort tokens
    const tokens = await getAllCohortTokens();

    // check if tokens found
    if (isEmpty(tokens)) {
      log(chalk.red(`AppError: tokens not found`));
      return res.status(500).json({
        code: 500,
        message: "AppError: tokens not found",
        data: {},
      });
    }

    // get the result
    let { ETH, BSC, POLYGON, AVAX } = tokens as CohortResponse;
    let [
      ethTokenBalances,
      bscTokenBalances,
      polygonTokenBalances,
      avaxTokenBalances,
    ] = await Promise.all([
      getTokenBalances(1, ETH as Token[]),
      getTokenBalances(56, BSC as Token[]),
      getTokenBalances(137, POLYGON as Token[]),
      getTokenBalances(43114, AVAX as Token[]),
    ]);
    return res.status(201).json({
      code: 201,
      message: "Token balances fetched successfully",
      data: {
        1: ethTokenBalances,
        56: bscTokenBalances,
        137: polygonTokenBalances,
        43114: avaxTokenBalances,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      log(chalk.red(`AppError: ${err.message}`));
      return res.status(500).json({
        code: 500,
        message: `AppError: ${err.message}`,
        data: {},
      });
    }
  }
});

app.use(function (req, res, next) {
  res.status(400).json({
    code: 400,
    message: "no route found.",
  });
});

app.listen(process.env.PORT, () => {
  log(chalk.blue(`tvl server started at ${process.env.PORT} port.`));
});
