#option to install if already done
install.packages("devtools")
library(devtools)
install_github("ohdsi/SqlRender")
library(SqlRender)

#user:  set these parameters however you'd like

OHDSIDirectory <- "F:/Documents/OHDSI/HERCULES/"
inputFile <- "HERCULESv5.sql"
inputPath <- paste(OHDSIDirectory,inputFile,sep="")
cdmSchema <- "CDM_TRUVEN_MDCR"
resultsSchema <- "CDM_TRUVEN_MDCR"
sourceName <- "JNJ_MDCR"
studyName <- "AntipsychAKI"

CDM_schema <- "OMOPV5_DE"
results_schema <- "OHDSI"
cohort_schema <- "OHDSI"
cohort_table <- "COHORT"
CDM_version <- 5
createTable = TRUE
runHERACLESHeel = FALSE

cohort_definition_id <- 1
list_of_analysis_ids <- '0,1,2,3,4,5,6,7,8,9,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,200,201,202,203,204,205,206,207,208,209,210,211,220,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,500,501,502,503,504,505,506,509,510,511,512,513,514,515,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,717,718,719,720,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1100,1101,1102,1103,1200,1201,1202,1203,1700,1701,1800,1801,1802,1803,1804,1805,1806,1807,1808,1809,1810,1811,1812,1813,1814,1815,1816,1817,1818,1819,1820,1821,1830,1831,1840,1841,1850,1851,1860,1861,1870,1871'
condition_concept_ids <- "312327"
drug_concept_ids <- "735979"
procedure_concept_ids <- "4226275"
observation_concept_ids <- "40765542"
measurement_concept_ids <- "40765542"

setwd(OHDSIDirectory)

renderedFile <- paste(OHDSIDirectory, "rendered ", inputFile, sep="")
renderSqlFile(inputFile, renderedFile, 
                CDM_schema = CDM_schema, results_schema = results_schema, cohort_table = cohort_table, cohort_schema=cohort_schema, CDM_version = CDM_version, 
              createTable = createTable, runHERACLESHeel = runHERACLESHeel,
              cohort_definition_id = cohort_definition_id, list_of_analysis_ids = list_of_analysis_ids,
              condition_concept_ids = condition_concept_ids, drug_concept_ids = drug_concept_ids, procedure_concept_ids = procedure_concept_ids, observation_concept_ids = observation_concept_ids, measurement_concept_ids = measurement_concept_ids)
translatedFile <- paste(OHDSIDirectory, "SQL translated ", inputFile, sep="")
translateSqlFile(renderedFile, translatedFile, sourceDialect = "sql server", targetDialect = "sql server")
translatedFile <- paste(OHDSIDirectory, "Oracle translated ", inputFile, sep="")
translateSqlFile(renderedFile, translatedFile, sourceDialect = "sql server", targetDialect = "oracle")
