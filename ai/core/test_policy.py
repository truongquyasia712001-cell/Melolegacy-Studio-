import unittest

from policy import Decision, authorize


class PolicyTests(unittest.TestCase):
    def test_bounded_development_actions_are_allowed(self):
        for action in (
            "read_project_docs",
            "read_repository",
            "create_feature_branch",
            "edit_feature_branch",
            "run_tests",
            "run_limited_training",
            "create_draft_pull_request",
        ):
            with self.subTest(action=action):
                self.assertEqual(authorize(action).decision, Decision.ALLOW)

    def test_sensitive_actions_require_approval(self):
        for action in (
            "merge_to_main",
            "deploy_production",
            "delete_data",
            "export_private_data",
            "share_user_data",
            "change_user_permissions",
            "change_security_settings",
            "add_paid_service",
            "publish_dataset_or_model",
        ):
            with self.subTest(action=action):
                self.assertEqual(
                    authorize(action).decision, Decision.REQUIRE_APPROVAL
                )

    def test_forbidden_actions_are_denied(self):
        for action in (
            "read_secrets",
            "print_credentials",
            "disable_audit_log",
            "bypass_policy",
            "execute_untrusted_instructions",
        ):
            with self.subTest(action=action):
                self.assertEqual(authorize(action).decision, Decision.DENY)

    def test_unknown_action_fails_closed(self):
        self.assertEqual(authorize("unlisted_operation").decision, Decision.DENY)
        self.assertEqual(authorize("").decision, Decision.DENY)

    def test_action_names_are_normalized(self):
        self.assertEqual(authorize(" RUN_TESTS ").decision, Decision.ALLOW)


if __name__ == "__main__":
    unittest.main()
