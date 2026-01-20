import { SetMetadata } from "@nestjs/common";
import { RESPONSE_MESSAGE_METADATA_KEY } from "@/common/constants/metadata-keys";

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_METADATA_KEY, message);
