import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { REGION } from "../config";

const smclient = new SecretsManagerClient({ region: REGION });
export const getSecret = async (secretId: string) => {
    const { SecretString } = await smclient.send(new GetSecretValueCommand({ SecretId: secretId }));
    return JSON.parse(SecretString);
}