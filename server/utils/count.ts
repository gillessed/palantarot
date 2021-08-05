export interface Aggregator<RECORD, VALUE, AGGREGATE> {
  name: string;
  initialValue: any;
  extractor: (record: RECORD) => VALUE | undefined;
  aggretator: (aggregate: AGGREGATE, value: VALUE) => AGGREGATE;
}

export interface Aggregate {
  id: string;
  values: {
    [key: string]: any;
  };
}

export function count<RECORD>(
  records: RECORD[],
  groupBy: (record: RECORD) => string,
  accessors: Aggregator<RECORD, any, any>[]
): Aggregate[] {
  const countMap = new Map<string, Aggregate>();
  records.forEach((record: RECORD) => {
    const id = groupBy(record);
    if (!countMap.has(id)) {
      countMap.set(id, getEmptyAggregate(record, groupBy, accessors));
    }
    const aggregate = countMap.get(id)!;
    const newAggregate: Aggregate = {
      id,
      values: {...aggregate.values},
    };
    accessors.forEach((accessor: Aggregator<RECORD, any, any>) => {
      const extracted = accessor.extractor(record);
      if (extracted !== undefined) {
        const aggregateValue = newAggregate.values[accessor.name];
        const newAggregateValue = accessor.aggretator(
          aggregateValue,
          extracted
        );
        newAggregate.values[accessor.name] = newAggregateValue;
      }
      countMap.set(id, newAggregate);
    });
  });
  return Array.from(countMap.values());
}

export function getEmptyAggregate<RECORD>(
  record: RECORD,
  groupBy: (record: RECORD) => string,
  accessors: Aggregator<RECORD, any, any>[]
): Aggregate {
  const aggregate: Aggregate = {
    id: groupBy(record),
    values: {},
  };
  accessors.forEach((accessor: Aggregator<RECORD, any, any>) => {
    aggregate.values[accessor.name] = accessor.initialValue;
  });
  return aggregate;
}
