import express, { Request, Response } from "express";
import { genRarity } from "./genRarity";

const app = express();

app.use(express.json());


app.get("/", async (req: Request, res: Response) => {
  const rarity = await genRarity()
  res.json(rarity);
});

app.listen(4000);
