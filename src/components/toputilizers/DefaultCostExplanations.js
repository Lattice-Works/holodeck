/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

const Wrapper = styled.div`
  display: block;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: #8e929b;
  padding: 20px 0;
  line-height: normal;

  &:not(:last-child) {
    border-bottom: 1px solid #e1e1eb;
  }

  span:first-child {
    font-weight: bold;
    text-transform: uppercase;
  }

  a {
    color: #6124e2;
  }
`;

/* eslint-disable max-len */

const JAIL_STAY = (
  <Wrapper key="JAIL_STAY">
    <span>Jail Stay </span>
    <a href="https://www.federalregister.gov/documents/2018/04/30/2018-09062/annual-determination-of-average-cost-of-incarceration">
       Bureau of Prisons 2018,
    </a>
    <span> based on the national daily cost of incarceration for federal inmates. No national averages were found for county jails and so this number is intended as a rough comparison.</span>
  </Wrapper>
);

const EMS = (
  <Wrapper key="EMS">
    <span>CFS -- EMS</span>
    <span> CFS — EMS We conservatively price ambulance base rates at $500 each, given that county and municipality estimates range widely from $400 to &gt; $2000 for a base rate.</span>
  </Wrapper>
);

// const ER_OUTPATIENT = (
//   <Wrapper key="ER_OUTPATIENT">
//     <span>ER Outpatient</span>
//     <span> ER OUTPATIENT The average price of an ER outpatient visit in 2016, according to claims data from four major insurance companies — HCCI 2018 </span>
//     <a href="https://www.healthcostinstitute.org/research/annual-reports/entry/2016-health-care-cost-and-utilization-report">HCCI 2018</a>
//   </Wrapper>
// );
//
// const ER_INPATIENT = (
//   <Wrapper key="ER_INPATIENT">
//     <span>ER Intpatient</span>
//     <span> ER INPATIENT The average cost of one day in a state/local government hospital (2013) added to the average price of an ER outpatient visit in 2016, to conservatively estimate the low end of an ER inpatient visit —-, </span>
//     <a href="https://www.beckershospitalreview.com/finance/average-cost-per-inpatient-day-across-50-states.html">Becker’s Hospital Review 2015, </a>
//     <a href="https://www.healthcostinstitute.org/research/annual-reports/entry/2016-health-care-cost-and-utilization-report">HCCI 2018</a>
//   </Wrapper>
// );

/* eslint-enable */

export default {
  [PROPERTY_TYPES.DURATION_DAYS]: JAIL_STAY,
  [PROPERTY_TYPES.TIME_SERVED_DAYS]: JAIL_STAY,
  [PROPERTY_TYPES.EMS_DEPT_MINUTES_PER_PERSON]: EMS
};
