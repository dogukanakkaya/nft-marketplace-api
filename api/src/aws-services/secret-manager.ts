import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const smclient = new SecretsManagerClient({});
export const getSecret = async (secretId: string) => {
    const { SecretString } = await smclient.send(new GetSecretValueCommand({ SecretId: secretId }));
    return JSON.parse(SecretString);
}