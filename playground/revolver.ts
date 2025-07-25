// @ts-nocheck
// Source: https://github.com/Innablr/revolver/blob/39607dbd6b28cc193792f7209dbccf2b0d548674/lib/config-schema.ts
import { z } from "zod";

const AWSAccountId = z
  .string()
  .regex(/^\d{12}$/, { message: "AWS AccountID are 12 digits" });

const AWSRegion = z
  .string()
  .regex(
    /^(af|il|ap|ca|eu|me|sa|us|cn|us-gov|us-iso|us-isob)-(central|(north|south)?(east|west)?)-\d{1}$/,
    {
      message: "Invalid AWS Region",
    },
  );

// https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
// https://stackoverflow.com/questions/50480924/regex-for-s3-bucket-name
const AWSBucketName = z
  .string()
  .regex(
    /(?!(^((2(5[0-5]|[0-4][0-9])|[01]?[0-9]{1,2})\.){3}(2(5[0-5]|[0-4][0-9])|[01]?[0-9]{1,2})$|^xn--|.+-s3alias$))^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/,
    { message: "Invalid AWS Bucket Name" },
  );

// https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html
const AWSArn = z.string().regex(/^arn:.*$/, { message: "Invalid AWS ARN" });

const ShorthandFilter = z.string().regex(/^([^|]+)\|.*/);

const StringCompareOptions = z.object({
  equals: z.string().optional(),
  iequals: z.string().optional(),
  contains: z.string().optional(),
  startswith: z.string().optional(),
  endswith: z.string().optional(),
  regexp: z.string().optional(),
});

const BaseFilters = z
  .object({
    id: z.union([z.array(z.string()), z.string()]).optional(),
    accountId: z.union([z.array(z.string()), z.string()]).optional(),
    region: z.union([z.array(z.string()), z.string()]).optional(),
    state: z.union([z.array(z.string()), z.string()]).optional(),
    type: z.union([z.array(z.string()), z.string()]).optional(),
    name: z.union([z.array(z.string()), z.string()]).optional(),
    bool: z.boolean().optional(), // TODO: what is this?
    tag: z
      .union([
        z.array(ShorthandFilter),
        ShorthandFilter,
        z
          .object({
            name: z.string(),
          })
          .merge(StringCompareOptions)
          .strict(),
      ])
      .optional(),
    resource: z
      .union([
        z.array(ShorthandFilter),
        ShorthandFilter,
        z
          .object({
            path: z.string(),
          })
          .merge(StringCompareOptions)
          .strict(),
      ])
      .optional(),
    matchWindow: z
      .object({
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .optional(),
  })
  .strict();

// meta filters are recursive, need this to allow parsing to occur properly
type FilterT = z.infer<typeof BaseFilters> & {
  not?: FilterT;
  or?: FilterT[];
  and?: FilterT[];
};

const Filters: z.ZodType<FilterT> = BaseFilters.extend({
  not: z.lazy(() => Filters).optional(),
  or: z.lazy(() => Filters.array()).optional(),
  and: z.lazy(() => Filters.array()).optional(),
}).strict();

const ObjectLogOptions = z.object({
  file: z.string().optional(),
  sqs: z
    .object({
      url: z.string().url(),
      compress: z.boolean().default(true),
      attributes: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  sns: z
    .object({
      url: AWSArn,
      compress: z.boolean().default(true),
      attributes: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  s3: z
    .object({
      bucket: AWSBucketName,
      region: AWSRegion,
      path: z.string(),
    })
    .optional(),
});

const TimeZoneString = z
  .string()
  .regex(/^([A-Za-z]+\/[A-Za-z_]+|UTC(?:[+-]\d+)?)$/, {
    message: "Invalid Timezone",
  });

const PowercycleCentralMatcher = z.object({
  name: z.string(),
  schedule: z.string(),
  priority: z.number().default(0),
  filter: z.union([z.array(Filters), Filters]),
  pretend: z.boolean().default(false),
});

// Used for defaults, and a partial used for org/account overrides
const Settings = z.object({
  region: AWSRegion.optional(),
  timezone: TimeZoneString.default("UTC"),
  timezoneTag: z.string().default("Timezone"),
  concurrency: z.number().default(0),
  organizationRoleName: z.string(),
  revolverRoleName: z.string(),
  resourceLog: z
    .object({
      json: z
        .object({
          overwrite: z.boolean().default(true),
        })
        .merge(ObjectLogOptions)
        .optional(),
      html: ObjectLogOptions.optional(),
      csv: z
        .object({
          append: z.boolean().default(false),
          overwrite: z.boolean().default(true),
          reportTags: z.array(z.string()).optional(),
        })
        .merge(ObjectLogOptions)
        .optional(),
      console: z
        .null()
        .or(
          z.object({
            reportTags: z.array(z.string()).optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  localResourcesFile: z.string().optional(),
  localOrgAccountsFile: z.string().optional(),
  localOrgAccountsWriteFile: z.string().optional(),
  auditLog: z
    .object({
      console: z.null().optional(),
      html: ObjectLogOptions.optional(),
      csv: z
        .object({
          append: z.boolean().default(false),
        })
        .merge(ObjectLogOptions)
        .optional(),
      json: ObjectLogOptions.optional(),
    })
    .optional(),
  excludeResources: z.union([z.array(Filters), Filters]).optional(),
  includeResourceTags: z.array(z.string()).optional(), // if not specified, include all Tags
});

const ConfigSchema = z
  .object({
    defaults: z.object({
      settings: Settings,
      drivers: z
        .array(
          z.object({
            name: z.string(),
            active: z.boolean().default(true),
            pretend: z.boolean().default(false),
          }),
        )
        .default([]),
      plugins: z
        .object({
          powercycle: z
            .object({
              active: z.boolean(),
              configs: z.array(
                z.object({
                  tagging: z.string().default("strict"),
                  availabilityTag: z.string().default("Schedule"),
                }),
              ),
            })
            .optional(),
          powercycleCentral: z
            .object({
              active: z.boolean(),
              configs: z.array(
                z.object({
                  parser: z.string().default("strict"),
                  availabilityTag: z.string().default("Schedule"),
                  availabilityTagPriority: z.number().default(0),
                  predefinedSchedules: z
                    .record(z.string(), z.string())
                    .default({}),
                  matchers: z.array(PowercycleCentralMatcher),
                }),
              ),
            })
            .optional(),
          validateTags: z
            .object({
              active: z.boolean(),
              configs: z.array(
                z.object({
                  tag: z.string(),
                  tagMissing: z.array(
                    z.union([z.string(), z.object({ setDefault: z.string() })]),
                  ),
                  onlyResourceTypes: z.array(z.string()),
                  tagNotMatch: z.array(z.any()),
                }),
              ),
            })
            .optional(),
        })
        .strict(),
    }),

    organizations: z
      .array(
        z
          .object({
            accountId: AWSAccountId,
            accountNameRegex: z.string().optional(),
            settings: z.object({ name: z.string() }).merge(Settings.partial()),
          })
          .strict(),
      )
      .default([]),

    accounts: z.object({
      includeList: z
        .array(
          z
            .object({
              accountId: AWSAccountId,
              settings: z
                .object({ name: z.string() })
                .merge(Settings.partial()),
            })
            .strict(),
        )
        .default([]),
      excludeList: z
        .array(
          z
            .object({
              accountId: AWSAccountId,
              settings: z.object({ name: z.string() }),
            })
            .strict(),
        )
        .default([]),
    }),
  })
  .transform((config) => {
    // copy .defaults.settings into .organizations[].settings
    config.organizations.forEach((org: any) => {
      org.settings = Object.assign({}, config.defaults.settings, org.settings);
    });
    // copy .defaults.settings into ..accounts.includeList[].settings
    config.accounts.includeList.forEach((account: any) => {
      account.settings = Object.assign(
        {},
        config.defaults.settings,
        account.settings,
      );
    });
    return config;
  });

export {
  AWSRegion,
  ConfigSchema,
  Filters,
  PowercycleCentralMatcher,
  TimeZoneString,
};
