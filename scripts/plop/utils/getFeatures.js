import fs from "fs";
import path from "path";

export const getFeatures = () => {
  const root = process.cwd();
  const features = fs.readdirSync(path.join(root, "src", "features"), {
    withFileTypes: true,
  });

  return features.filter((dir) => dir.isDirectory()).map((dir) => dir.name);
};
