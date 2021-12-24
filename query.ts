export const COHORTS_QUERY = `
query GetCohort($where: CohortGroupWhereClause!) {
    allCohortsAndProxies(where: $where) {
      cohortAddress
      proxies
    }
  }
`;
