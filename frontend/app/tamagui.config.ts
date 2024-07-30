import { createTamagui } from "tamagui";
import * as themes from "./themes";
import { tokens } from "@tamagui/config/v3";

export const config = createTamagui({
  tokens,
  themes,
  // ...the rest of your config
});
