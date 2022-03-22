export const COHORTS_QUERY = `
query AllPools($where: PoolsGroupWhereClause!) {
  allPools(where: $where) {
    pools {
      token {
        tokenId
        decimals
      }
      cohort {
        cohortAddress
        proxies
      }
    }
  }
}
`;
