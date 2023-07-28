import { PipelineParams } from 'src/types/pipeline-params';
import { getPipelineStage } from './get-pipeline-stage';

export function getPipeline(params: PipelineParams) {
  if (params.lookups) {
    for (const lookup of params.lookups) {
      params.pipeline.lookup({
        localField: lookup.localField,
        from: lookup.from,
        foreignField: lookup.foreignField,
        as: lookup.localField,
      });
      params.pipeline.unwind({ path: `$${lookup.localField}` });
    }
  }

  if (params.filters) {
    for (const filter of params.filters) {
      getPipelineStage(params.pipeline, filter);
    }
  }

  if (params.sorts) {
    for (const sort of params.sorts) {
      if (sort.caseInsensitive) {
        params.pipeline.addFields({
          lowerName: { $toLower: `$${sort.name}` },
        });
        params.pipeline.sort({ lowerName: 1 });
      } else {
        const field = {};
        field[`${sort.name}`] = parseInt(sort.order.toString());
        params.pipeline.sort(field);
      }
    }
  }
}
