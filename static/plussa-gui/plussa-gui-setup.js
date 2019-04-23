var plussaGuiSettings = {
	baseRestUrl: "https://gitlab.com/api/v4/",
	errorCallback: function(status, errorThrown) {
		$('#plussaGuiReport').text("Error: "+status);
	}
}

var projectsGitLabJSON = [{"id":11862275,"description":"","name":"Testinen","name_with_namespace":"Petteri Järvinen / Testinen","path":"testinen","path_with_namespace":"pjarvinen/testinen","created_at":"2019-04-15T10:20:41.799Z","default_branch":"master","tag_list":[],"ssh_url_to_repo":"git@gitlab.com:pjarvinen/testinen.git","http_url_to_repo":"https://gitlab.com/pjarvinen/testinen.git","web_url":"https://gitlab.com/pjarvinen/testinen","readme_url":"https://gitlab.com/pjarvinen/testinen/blob/master/README.md","avatar_url":null,"star_count":0,"forks_count":0,"last_activity_at":"2019-04-15T10:20:41.799Z","namespace":{"id":4641521,"name":"pjarvinen","path":"pjarvinen","kind":"user","full_path":"pjarvinen","parent_id":null},"_links":{"self":"https://gitlab.com/api/v4/projects/11862275","issues":"https://gitlab.com/api/v4/projects/11862275/issues","merge_requests":"https://gitlab.com/api/v4/projects/11862275/merge_requests","repo_branches":"https://gitlab.com/api/v4/projects/11862275/repository/branches","labels":"https://gitlab.com/api/v4/projects/11862275/labels","events":"https://gitlab.com/api/v4/projects/11862275/events","members":"https://gitlab.com/api/v4/projects/11862275/members"},"archived":false,"visibility":"private","owner":{"id":3570802,"name":"Petteri Järvinen","username":"pjarvinen","state":"active","avatar_url":"https://secure.gravatar.com/avatar/66d79803e770babf4b7f75f74f7cc9c4?s=80\u0026d=identicon","web_url":"https://gitlab.com/pjarvinen"},"resolve_outdated_diff_discussions":false,"container_registry_enabled":true,"issues_enabled":true,"merge_requests_enabled":true,"wiki_enabled":true,"jobs_enabled":true,"snippets_enabled":true,"shared_runners_enabled":true,"lfs_enabled":true,"creator_id":3570802,"import_status":"none","open_issues_count":0,"public_jobs":true,"ci_config_path":null,"shared_with_groups":[],"only_allow_merge_if_pipeline_succeeds":false,"request_access_enabled":false,"only_allow_merge_if_all_discussions_are_resolved":false,"printing_merge_request_link_enabled":true,"merge_method":"merge","permissions":{"project_access":{"access_level":40,"notification_level":3},"group_access":null},"mirror":false,"external_authorization_classification_label":""},{"id":10918435,"description":"Test project for TIETS19 / TIEA4 course work at Tampere University","name":"TuniPlussa","name_with_namespace":"Petteri Järvinen / TuniPlussa","path":"tuniplussa","path_with_namespace":"pjarvinen/tuniplussa","created_at":"2019-02-19T13:11:07.251Z","default_branch":"master","tag_list":[],"ssh_url_to_repo":"git@gitlab.com:pjarvinen/tuniplussa.git","http_url_to_repo":"https://gitlab.com/pjarvinen/tuniplussa.git","web_url":"https://gitlab.com/pjarvinen/tuniplussa","readme_url":"https://gitlab.com/pjarvinen/tuniplussa/blob/master/README.md","avatar_url":null,"star_count":0,"forks_count":0,"last_activity_at":"2019-04-15T10:22:19.249Z","namespace":{"id":4641521,"name":"pjarvinen","path":"pjarvinen","kind":"user","full_path":"pjarvinen","parent_id":null},"_links":{"self":"https://gitlab.com/api/v4/projects/10918435","issues":"https://gitlab.com/api/v4/projects/10918435/issues","merge_requests":"https://gitlab.com/api/v4/projects/10918435/merge_requests","repo_branches":"https://gitlab.com/api/v4/projects/10918435/repository/branches","labels":"https://gitlab.com/api/v4/projects/10918435/labels","events":"https://gitlab.com/api/v4/projects/10918435/events","members":"https://gitlab.com/api/v4/projects/10918435/members"},"archived":false,"visibility":"private","owner":{"id":3570802,"name":"Petteri Järvinen","username":"pjarvinen","state":"active","avatar_url":"https://secure.gravatar.com/avatar/66d79803e770babf4b7f75f74f7cc9c4?s=80\u0026d=identicon","web_url":"https://gitlab.com/pjarvinen"},"resolve_outdated_diff_discussions":false,"container_registry_enabled":true,"issues_enabled":true,"merge_requests_enabled":true,"wiki_enabled":true,"jobs_enabled":true,"snippets_enabled":true,"shared_runners_enabled":true,"lfs_enabled":true,"creator_id":3570802,"import_status":"none","open_issues_count":0,"public_jobs":true,"ci_config_path":null,"shared_with_groups":[],"only_allow_merge_if_pipeline_succeeds":false,"request_access_enabled":false,"only_allow_merge_if_all_discussions_are_resolved":false,"printing_merge_request_link_enabled":true,"merge_method":"merge","permissions":{"project_access":{"access_level":40,"notification_level":3},"group_access":null},"mirror":false,"external_authorization_classification_label":""}];

$(document).ready(function(){
  // Setup markItUp! a javascript text editor
	$('#markItUp').markItUp(markItUpSettings);

	var testFileTree = plussaGuiFileManager.setUserProjects(projectsGitLabJSON);
	console.log(testFileTree);

  $('#fileTree').fileTree({ treeStructure: testFileTree }, function(file) {
		alert(file);
	});

	$('#loadProjectsBtn').click(function() {
		var userId = $('#userId').val();
		var privateToken = $('#privateToken').val();
		if(!userId || !privateToken) {
			plussaGuiSettings.errorCallback(400, "Error!");
		}
		else {
			// Construct a folder list presentation of the user's GitLab projects
			plussaGuiGitlabRest.loadProjects(userId, privateToken, function(result) {
				console.log(JSON.stringify(result));
			});
		}
	});

});
