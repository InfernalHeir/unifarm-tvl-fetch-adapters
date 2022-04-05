import express, { Application, Request, Response } from "express";
import { json, urlencoded } from "body-parser";
import morgon from "morgan";
import cors from "cors";
import chalk from "chalk";
import helmet from "helmet";
import { config } from "dotenv";
import { CohortResponse, getAllCohortTokens, Token, getTokenPrice, calculateTvl, getEthRemainingTokenPrice } from "./helpers";
import { isEmpty } from "lodash";
import { getTokenBalances } from "./multicall";
import NodeCache from "node-cache";

config({ path: ".env" });

const app: Application = express();
let log = console.log;

const MyCache = new NodeCache({ stdTTL: 7200, checkperiod: 7200});

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

  if (MyCache.has("tvl")) {
    return res.status(200).json({
      code: 201,
      message: "Total TVL fetched successfully",
      data: {
        1: MyCache.get(1),
        56: MyCache.get(56),
        137: MyCache.get(137),
        43114: MyCache.get(43114),
        tvl: MyCache.get("tvl")
      }
    })
  }

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

    const ethTokens = tokens?.ETH?.map((token) => token.token.tokenId)
    const BSCTokens = tokens?.BSC?.map((token) => token.token.tokenId)
    const polygonTokens = tokens?.POLYGON?.map((token) => token.token.tokenId)
    const avaxTokens = tokens?.AVAX?.map((token) => token.token.tokenId)

    const ethTokenPrice = await getTokenPrice(1, ethTokens);
    const bscTokenPrice = await getTokenPrice(56, BSCTokens);
    const polygonTokenPrice = await getTokenPrice(137, polygonTokens);
    const avaxTokenPrice = await getTokenPrice(43114, avaxTokens);
    const remainingTokenPrice = await getEthRemainingTokenPrice();
    
    // console.log(remainingTokenPrice);
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

    // console.log('------ Ethereum -------');
    let ethereumTvl = calculateTvl(ethTokenBalances, ethTokenPrice, remainingTokenPrice);
    // console.log('------ BSC -------');
    let bscTvl = calculateTvl(bscTokenBalances, bscTokenPrice, remainingTokenPrice);
    // console.log('------ Polygon -------');
    let polygonTvl = calculateTvl(polygonTokenBalances, polygonTokenPrice, remainingTokenPrice);
    // console.log('------ Avalanche -------');
    let avaxTvl = calculateTvl(avaxTokenBalances, avaxTokenPrice, remainingTokenPrice);
    
    // set my-cache
    MyCache.set("tvl", ethereumTvl + polygonTvl + bscTvl + avaxTvl);
    MyCache.set(1, ethereumTvl);
    MyCache.set(56, bscTvl);
    MyCache.set(137, polygonTvl);
    MyCache.set(43114, avaxTvl)

    return res.status(201).json({
      code: 201,
      message: "TVL fetched successfully",
      data: {
        1: ethereumTvl,
        56: bscTvl,
        137: polygonTvl,
        43114: avaxTvl,
        tvl: ethereumTvl + polygonTvl + bscTvl + avaxTvl,
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
