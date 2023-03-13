import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const smClient = new SecretsManagerClient({});
export const getSecret = async (secretId: string) => {
    const { SecretString } = await smClient.send(new GetSecretValueCommand({ SecretId: secretId }));
    return JSON.parse(SecretString);
}