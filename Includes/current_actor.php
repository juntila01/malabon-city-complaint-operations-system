<?php

function getCurrentActor(): array
{
    if (isset($_SESSION['citizenID'])) {

        return [
            'type' => 'Citizen',
            'id'   => (int) $_SESSION['citizenID'],
            'name' => $_SESSION['fullName'] ?? 'Citizen'
        ];
    }

    if (isset($_SESSION['systemUsersID'])) {

        return [
            'type' => 'System User',
            'id'   => (int) $_SESSION['systemUsersID'],
            'name' => $_SESSION['name'] ?? 'System User'
        ];
    }

    if (isset($_SESSION['dispatchTeamID'])) {

        return [
            'type' => 'Dispatch Team',
            'id'   => (int) $_SESSION['dispatchTeamID'],
            'name' => $_SESSION['dispatchTeamName'] ?? 'Dispatch Team'
        ];
    }

    return [
        'type' => 'System',
        'id'   => null,
        'name' => 'System'
    ];
}