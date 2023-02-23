import { collectionAddress, collectionName } from "./config/config";
import fs from "fs";
import { metaData, traitTypes } from "./types/types";
import { resolveLink } from "./helpers/resolveLink";
import fetch from "node-fetch";

export async function genRarity() {
  const file = await fs.readFileSync(__dirname + "/config/metadata.json");
  const json = JSON.parse(file.toString());
  const metaDataAr: any = [];
  const totalSup = json.length;

  let metadata = await Promise.all(
    json.map((e: metaData) => metaDataAr.push(e.attributes))
  );

  let tally: any = { TraitCount: {} };

  for (let i = 0; i < metaDataAr.length; ++i) {
    let traitTypes = metaDataAr[i].map((e: traitTypes) => e.trait_type);
    let traitValues = metaDataAr[i].map((e: traitTypes) => e.value);

    let traitNum = traitTypes.length;

    if (tally.TraitCount[traitNum]) {
      tally.TraitCount[traitNum]++;
    } else {
      tally.TraitCount[traitNum] = 1;
    }

    for (let i = 0; i < traitTypes.length; ++i) {
      let currentType = traitTypes[i];

      if (tally[currentType]) {
        tally[currentType].occurences++;
      } else {
        tally[currentType] = { occurences: 1 };
      }

      let currentValue = traitValues[i];

      if (tally[currentType][currentValue]) {
        tally[currentType][currentValue]++;
      } else {
        tally[currentType][currentValue] = 1;
      }
    }
  }

  const collectionAttributes = Object.keys(tally);

  let nftArr: any = [];

  for (let i = 0; i < metaDataAr.length; ++i) {
    let current = metaDataAr[i];
    let totalRarity = 0;

    for (let i = 0; i < current.length; ++i) {
      let rarityScore =
        1 / (tally[current[i].trait_type][current[i].value] / totalSup);
      current[i].rarityScore = rarityScore;
      totalRarity += rarityScore;
    }

    let rarityScoreNumTraits =
      8 * (1 / (tally.TraitCount[Object.keys(current).length] / totalSup));
    current.push({
      trait_type: "TraitCount",
      value: Object.keys(current).length,
      rarityScore: rarityScoreNumTraits,
    });
    totalRarity += rarityScoreNumTraits



    if (json[i]) {
      json[i].metadata = json[i];
      json[i].image = resolveLink(json[i]?.image);
    } else if (json[i].token_uri) {
      try {
        console.log("fetch");
        /* await fetch(json[i].token_uri).then((res: any) => res.json)
            .then((data: any) => {
                json[i].image = resolveLink(data.image)
            })*/
      } catch (err) {
        console.log(err);
      }
    }

    nftArr.push({
      Attributes: current,
      Rarity: totalRarity,
      token_id: json[i].id,
      image: json[i].image,
    });
  }
  
  nftArr.sort((a: any, b: any) => b.rarity - a.rarity)

  for (let i = 0; i < nftArr.length; ++i) {
    nftArr[i].Rank = i + 1;
  }

  fs.writeFileSync(__dirname + "/config/rarity.json", JSON.stringify(nftArr));

  return nftArr;
}
