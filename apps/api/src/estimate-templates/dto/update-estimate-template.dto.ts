import { PartialType } from "@nestjs/swagger";
import { CreateEstimateTemplateDto } from "./create-estimate-template.dto";

export class UpdateEstimateTemplateDto extends PartialType(CreateEstimateTemplateDto) {}

