#option to install if already done
install.packages("devtools")
library(devtools)
install_github("ohdsi/SqlRender")
library(SqlRender)

#user:  set these parameters however you'd like

OHDSIDirectory <- "F:/Documents/OHDSI/HERCULES/"
inputFile <- "HERCULES export templateSQL.sql"
inputPath <- paste(OHDSIDirectory,inputFile,sep="")
cdmSchema <- "[OMOP_Vocabulary_V5.0_20141020]"
resultsSchema <- "scratch"
heraclesResultsTable <- "PBR_RI_HERACLES_RESULTS"
heraclesResultsDistTable <- "PBR_RI_HERACLES_RESULTS_DIST"
achillesResultsTable <- "PBR_RI_ACHILLES_RESULTS"
achillesResultsDistTable <- "PBR_RI_ACHILLES_RESULTS_DIST"
cohortDefinitionId <- 432300
minCovariatePersonCount <- 1000
minIntervalPersonCount <- 1000

setwd(OHDSIDirectory)

renderedFile <- paste(OHDSIDirectory, "rendered ", inputFile, sep="")
renderSqlFile(inputFile, renderedFile, 
              cdmSchema = cdmSchema, resultsSchema=resultsSchema,
              heraclesResultsTable = heraclesResultsTable, heraclesResultsDistTable = heraclesResultsDistTable,
              achillesResultsTable = achillesResultsTable, achillesResultsDistTable = achillesResultsDistTable,
              cohortDefinitionId = cohortDefinitionId, minCovariatePersonCount = minCovariatePersonCount, minIntervalPersonCount = minIntervalPersonCount)
translatedFile <- paste(OHDSIDirectory, "SQL translated ", inputFile, sep="")
translateSqlFile(renderedFile, translatedFile, sourceDialect = "sql server", targetDialect = "sql server")
#translatedFile <- paste(OHDSIDirectory, "Oracle translated ", inputFile, sep="")
#translateSqlFile(renderedFile, translatedFile, sourceDialect = "sql server", targetDialect = "oracle")