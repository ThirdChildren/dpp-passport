import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("ProductPassport", {
    from: deployer,
    args: [], // constructor senza parametri aggiuntivi
    log: true,
  });

  // Trasferisci ownership al burner wallet dopo il deploy
  const burnerWallet = "0xf76C1f676d355782B1FCcC39DDFBFc0e93bB1d09"; // Sostituisci con l'indirizzo desiderato se necessario
  const { execute } = deployments;
  await execute("ProductPassport", { from: deployer, log: true }, "transferOwnership", burnerWallet);
};

func.tags = ["ProductPassport"];
export default func;
