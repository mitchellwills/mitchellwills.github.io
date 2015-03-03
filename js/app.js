angular.module('home', ['ngRoute', 'ngAnimate', 'angulartics', 'angulartics.google.analytics'])
	.config(function($routeProvider, $locationProvider, $rootScopeProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!');
		$routeProvider.when('/', {
			templateUrl: '/views/main.html',
			controller: 'MainCtrl',
			tab: 'main',
		});
		$routeProvider.when('/education', {
			templateUrl: '/views/education.html',
			controller: 'EducationCtrl',
			tab: 'education',
		});
		$routeProvider.when('/experience', {
			templateUrl: '/views/experience.html',
			controller: 'ExperienceCtrl',
			tab: 'experience',
		});
		$routeProvider.when('/projects', {
			templateUrl: '/views/projects.html',
			controller: 'ProjectsCtrl',
			tab: 'projects',
		});
		$routeProvider.when('/project/:projectId', {
			templateUrl: '/views/project.html',
			controller: 'ProjectCtrl',
			tab: 'projects',
		});
		$routeProvider.otherwise({
			templateUrl: '/views/404.html',
		});
	})
	.controller('NavCtrl', ['$scope', '$route', 'ProfileService', function($scope, $route, ProfileService){
		$scope.nav = [
		{
			display: "Education",
			link: "/education",
			name: 'education',
		},
		{
			display: "Experience",
			link: "/experience",
			name: 'experience',
		},
		{
			display: "Projects",
			link: "/projects",
			name: 'projects',
		},
		];
		$scope.$route = $route;
		$scope.closeNav = function(){
			if($("#navbar-collapse-button").css('display') !== 'none')
				$('#navbar-collapse').collapse('hide');
		};
		$scope.profiles = ProfileService.profiles;
	}])
	.controller('MainCtrl', ['$scope', function($scope){
	}])
	.controller('EducationCtrl', ['$scope', function($scope){
	
	}])
	.controller('ExperienceCtrl', ['$scope', 'ExperienceService', 'ProjectService', function($scope, ExperienceService, ProjectService){
		$scope.ProjectService = ProjectService;
		$scope.work = ExperienceService.work;
		$scope.skills = ExperienceService.skills;
		$scope.hover = {item: null, clicked: false};
		$scope.hoverItem = function(item){
			if(!$scope.hover.clicked)
				$scope.hover.item = item;
		};
		$scope.clickItem = function(item){
			if($scope.hover.item == item){
				$scope.hover.clicked = !$scope.hover.clicked;
			}
			else{
				$scope.hover.clicked = true;
				$scope.hover.item = item; 
			}
		};
		$scope.unhoverItem = function(){
			if(!$scope.hover.clicked)
				$scope.hover.item = null;
		};
	}])
	.controller('ProjectsCtrl', ['$scope', 'ProjectService', '$location', '$route', function($scope, ProjectService, $location, $route){
		$scope.projects = ProjectService.projects;
		$scope.ProjectService = ProjectService;
	}])
	.controller('ProjectCtrl', ['$scope', 'ProjectService', '$location', '$route', '$analytics', function($scope, ProjectService, $location, $route, $analytics){
		$scope.project = ProjectService.projectFromId($route.current.params.projectId);
		$scope.mediaThumbnail = function(media){
			if(media.type=='image')
				return media.image;
			else if(media.type=='youtube')
				return 'http://img.youtube.com/vi/'+media.youtubeId+'/mqdefault.jpg';
		};
		function createFancyBoxData(){
			var data = [];
			for(var i in $scope.project.media){
				var media = $scope.project.media[i];
				var mediaData = {
					title : media.label,
					thumbnail: $scope.mediaThumbnail(media),
				};
				if(media.type=='image')
					$.extend(mediaData, {href : media.image});
				else if(media.type=='youtube')
					$.extend(mediaData, {href : "http://www.youtube.com/watch?v="+media.youtubeId});
				data.push(mediaData);
			}
			return data;
		}

		$scope.selectMedia = function(media){
			$analytics.eventTrack('thumbnailClick', {  category: 'viewProjectMedia', label: media.label });
			$.fancybox.open(createFancyBoxData(), {
				padding: 0,
				nextEffect  : 'fade',
				prevEffect  : 'fade',
				index : $scope.project.media.indexOf(media),
				helpers : {
					media : {},
					thumbs : {
						width: 50,
						height: 50,
						source: function(item){
							return item.thumbnail;
						},
					},
					title : {
						type : 'float',
					},
				},
			});
		};

	}])






	.service('ProjectService', ['$location', function($location){
		var projects = includeFile("data/projects.json");

		function navToProject(project){
			if(!project)
				return;
			if(project.url)
				window.location.href = project.url;
			else
				$location.path("/project/"+project.id);
		}

		function projectBackgroundStyle(project){
			if(!project)
				return;
			var style = "";
			if(project.color)
				style += " "+project.color;
			if(project.image)
				style += " url('"+project.image+"')";
			return style;
		}

		return {
			projects: projects,
			navToProject: navToProject,
			projectBackgroundStyle: projectBackgroundStyle,
			projectFromId: function(id){
			for(var i in projects){
				var project = projects[i];
				if(project.id==id)
				return project;
			}
			}
		};
	}])
	.service('ExperienceService', function(){
		var work = includeFile("data/work.json");
		var skills = includeFile("data/skills.json");
		return {
			work: work,
			skills: skills,
		};
	})
	.service('ProfileService', function(){
		var profiles = includeFile("data/profiles.json");
		return {
			profiles: profiles,
		};
	})
	.directive('tile', function() {
		return {
			restrict: 'E',
			scope: {
				contentBackground: '@',
				label: '@',
				sublabel: '@',
			},
			transclude: true,
			replace: true,
			template: '<div class="tile no-select">'+
			'<div class="tile-content" style="background: {{contentBackground}};background-size: cover;background-repeat: no-repeat;background-position: 50% 50%;" ng-transclude>'+
			'</div>'+
			'<div class="tile-label">'+
			'<div>{{label}}</div>'+
			'<div class="tile-label-sub">{{sublabel}}</div>'+
			'</div>'+
			'</div>',
		};
	});
