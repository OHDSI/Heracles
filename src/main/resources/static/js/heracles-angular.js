// initialize angular
(function() {
    angular.module('Heracles', []).controller('CohortExplorerCtrl', function($scope, $http) {
    	$scope.showCohort = function(datum) {
  		  $http.get('/data/sample-cohort-explorer.json')
  	       .then(function(res){
  	    	   res.data.completed_cohorts = {};
  	    	   res.data.new_cohorts = {};
  	    	   $.each(res.data.analyses, function() {
  	    		   if (this.done === true) {
  	    			   if (!res.data.completed_cohorts[this.category]) {
  	    				 res.data.completed_cohorts[this.category] = [];
  	    			   }
  	    			   res.data.completed_cohorts[this.category].push(this);
  	    		   } else {
  	    			   if (!res.data.new_cohorts[this.category]) {
	    				 res.data.new_cohorts[this.category] = [];
	    			   }
	    			   res.data.new_cohorts[this.category].push(this);
  	    		   }
  	    	   });
  	    	   $scope.cohort = res.data;      
  	    	 showAgeDistribution(res.data.age_distribution);
  	    	 showGenderDistribution(res.data.gender_distribution);
  	        });
    	}
    	
    });
}());