import { SetMetadata } from "@nestjs/common";
import { SKIP_RESPONSE_WRAPPER_METADATA_KEY } from "@/common/constants/metadata-keys";

export const SkipResponseWrapper = () =>
    SetMetadata(SKIP_RESPONSE_WRAPPER_METADATA_KEY, true);
