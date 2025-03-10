import { cd, cp, exec, mkdir } from "shelljs";
import { getConfig } from "./helpers/config";
import { getOctokit } from "./helpers/github";
import { shouldContinue } from "./helpers/init-check";

export const generateSite = async () => {
  if (!(await shouldContinue())) return;
  let [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  const config = await getConfig();
  const octokit = await getOctokit();
  const repoDetails = await octokit.repos.get({ owner, repo });
  const siteDir = "site";
  mkdir(siteDir);
  cd(siteDir);
  /**
   * If this is a private repository, we don't publish a status page
   * by default, but can be overwritten with `publish: true`
   */
  if (repoDetails.data.private && !(config["status-website"] || {}).publish) {
    mkdir("-p", "status-page/__sapper__/export");
    exec("echo 404 > status-page/__sapper__/export/index.html");
    cd("../..");
    return;
  }
  exec("npm init -y");
  exec("npm i @upptime/status-page");
  cp("-r", "node_modules/@upptime/status-page/*", ".");
  exec("npm i");
  exec("npm run export");
  mkdir("-p", "status-page/__sapper__/export");
  cp("-r", "__sapper__/export/*", "status-page/__sapper__/export");
  cd("../..");
};
