import { getFqnString } from './DataUtils';

const titleProperties = {
  // PERSON
  'general.person': [
    'nc.PersonSurName',
    'nc.PersonGivenName'
  ],
  'sample.person2': [
    'general.lastname',
    'general.firstname'
  ],
  'nc.PersonType': [
    'nc.PersonSurName',
    'nc.PersonGivenName'
  ],
  'nc.PersonType2': [
    'nc.PersonSurName',
    'nc.PersonGivenName'
  ],

  // CASE
  'general.case': [
    'justice.courtcasenumber'
  ],
  'danecountywi.dacase': [
    'justice.courtcasenumber'
  ],

  // LOCATION
  'general.location': [
    'general.address'
  ],
  'general.LocationType': [
    'nc.LocationCityName',
    'nc.LocationStateName'
  ],

  // BOOKINGS
  'j.BookingType': [
    'publicsafety.CustodyID',
    'j.SubjectBooking'
  ],
  'sample.bookings2': [
    'publicsafety.datebooked2'
  ],
  'jciowa.JailBookingType2': [
    'publicsafety.datebooked2'
  ],
  'jciowa.BookingType': [
    'publicsafety.datebooked2'
  ],

  // CHARGES
  'j.ChargeType': [
    'j.ArrestCharge',
    'publicsafety.datereleased2'
  ],
  'jciowa.ChargeType': [
    'j.ChargeSequenceID',
    'j.CourtEventCase'
  ],
  'jciowa.ChargesType': [
    'j.ChargeSequenceID',
    'j.CourtEventCase'
  ],
  'jciowa.ChargesType2': [
    'j.ChargeSequenceID',
    'j.CourtEventCase'
  ],

  // JAIL RECORDS
  'jciowa.JailRecordType': [
    'publicsafety.ArrestID'
  ],
  'jciowa.JailRecordType2': [
    'publicsafety.ArrestID'
  ],

  // ENFORCEMENT OFFICIALS
  'j.EnforcementOfficialType': [
    'j.EnforcementOfficialCategoryText',
    'nc.PersonSurName'
  ],
  'j.EnforcementOfficialType2': [
    'j.EnforcementOfficialCategoryText',
    'nc.PersonSurName'
  ],

  // OFFENSE TYPES
  'jciowa.OffenseType': [
    'publicsafety.OffenseViolatedStateStatute',
    'publicsafety.OffenseViolatedLocalStatute'
  ],
  'jciowa.OffensesType': [
    'publicsafety.OffenseViolatedStateStatute',
    'publicsafety.OffenseViolatedLocalStatute'
  ],
  'jciowa.OffensesType2': [
    'publicsafety.OffenseViolatedStateStatute',
    'publicsafety.OffenseViolatedLocalStatute'
  ],

  // SENTENCE TYPES
  'jciowa.SentenceType': [
    'publicsafety.SentenceTermDays',
    'publicsafety.SentenceTermHours'
  ],
  'jciowa.SentencesType': [
    'publicsafety.SentenceTermDays',
    'publicsafety.SentenceTermHours'
  ],
  'jciowa.SentencesType2': [
    'publicsafety.SentenceTermDays',
    'publicsafety.SentenceTermHours'
  ],

  // OTHER
  'publicsafety.GangType': [
    'publicsafety.GangName'
  ],
  'j.WarrantType': [
    'j.WarrantLevelText'
  ],
  'j.ServiceCallType': [
    'publicsafety.CadEventNumber'
  ],

  // PSA
  'publicsafety.pretrialstatuscaseprocessings': [
    'j.CaseNumberText'
  ],
  'justice.charge': [
    'event.OffenseLocalCodeSection',
    'event.OffenseLocalDescription',
  ],
  'justice.case': [
    'justice.courtcasetype'
  ],
  'j.sentence': [
    'justice.incarcerationlocation'
  ],
  'justice.bond': [
    'justice.bonddescription'
  ],
  'justice.fta': [
    'general.id'
  ],
  'justice.psa': [
    'psa.ncaScale',
    'psa.ftaScale',
    'psa.nvcaFlag'
  ],
  'justice.dmf': [
    'criminaljustice.releasetype'
  ],
  'publicsafety.releaserecommendation': [
    'publicsafety.recommendation'
  ],

  // JC
  'justice.booking': [
    'j.OffenseViolatedStatute',
    'justice.Bail',
    'j.ArrestAgency'
  ],
  'justice.JailBooking': [
    'j.ArrestAgency',
    'scr.DetentionReleaseReasonCategoryCodeType',
    'j.ArrestSequenceID'
  ],
  'publicsafety.callforservice': [
    'publicsafety.dispatchtype',
    'criminaljustice.disposition'
  ],
  'criminaljustice.incident': [
    'criminaljustice.localstatute',
    'criminaljustice.nibrs'
  ],
  'criminaljustice.arrestedin': [
    'ol.arrestcategory',
    'criminaljustice.localstatute'
  ],
  'housing.stay': [
    'housing.programtype',
    'housing.lengthofstay'
  ]
};

function getFqn(edmObj) {
  return getFqnString(edmObj.get('type'));
}

export default function getTitle(entityType, entity) {
  const titleProps = titleProperties[getFqn(entityType)];
  if (titleProps) {
    const titleValues = titleProps.map(propertyTypeFqn => entity.getIn([propertyTypeFqn, 0])).filter(val => !!val);
    if (titleValues.length) return titleValues.join(', ');
  }
  return `[${entityType.get('title')}]`;
}

// just a copy of getTitle, but passing in selectedEntity instead
// this should all just be temporary
export function getTitleV2(entityType, selectedEntity) {
  const formattedRow = selectedEntity.get('data').toJS();
  const titleProps = titleProperties[getFqn(entityType)];
  if (titleProps) {
    const titleValues = titleProps.map((propertyTypeFqn) => {
      return formattedRow[propertyTypeFqn];
    });
    if (titleValues.length) return titleValues.join(', ');
  }
  return `[${entityType.title}]`;
}
