PUT _ilm/policy/service-ilm-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "10MB",
            "max_age": "3d"
          }
        }
      },
      "delete": {
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
