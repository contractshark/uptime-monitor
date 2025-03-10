import axios from "axios";
import { readFile } from "fs-extra";
import { join } from "path";

export const shouldContinue = async (): Promise<boolean> => {
  let [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  if (`${owner}/${repo}` === "upptime/upptime") return true;
  try {
    const upptimeDefaultConfig = await axios.get(
      "https://raw.githubusercontent.com/upptime/upptime/HEAD/.upptimerc.yml"
    );
    const thisRepoConfig = await readFile(join(".", ".upptimerc.yml"), "utf8");
    if (upptimeDefaultConfig.data.trim() === thisRepoConfig.trim()) {
      console.log(`

[warn] > UPPTIME WARNING
[warn] > You should change your Upptime configuration (.upptimerc.yml)
[warn] > Upptime workflows will NOT work until you've added custom configuration

`);
      return false;
    }
  } catch (error) {}
  return true;
};
