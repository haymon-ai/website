# Control your software supply chain in the age of AI agents.

Developers and AI agents add dependencies faster than anyone can review them. haymon is a private registry on your own server that serves only the packages you've let in.

## The interface

- **Packages**: Every package the registry serves, the source it came from, how many versions it holds and when it last changed. Search it, or import a whole lock file at once.
- **Package details**: Versions, dependencies and dependents, license and source for each package, with the install command ready to copy and a one-click sync.
- **Sources**: Public registries and private git repositories, in the order haymon asks them. When two sources offer the same release, priority decides which one supplies it.
- **Source details**: Each source shows the packages it supplies, its full catalog and its settings, from the repository URL to the credential it uses.
- **Users**: Invite teammates, make them administrators or members, and deactivate access when someone leaves. Last-active times show who still uses the registry.
- **Credentials**: Tokens, SSH keys and passwords for your private repositories, kept in one place and picked per source, with a count of where each one is used.

## Control: nothing reaches your builds that you didn't let in

- **A closed catalog**: haymon serves the packages you imported and everything they require. Any other name gets a 404.
- **Versions you allow**: Set a version range on a package, and releases outside it are never mirrored and can never be downloaded.
- **Private names stay private**: A package from your own source is only ever fetched from it. Public registries are never asked, so a squatter can't slip in.
- **Copies on your disk**: Archives are served from your server once built, each with its checksum recorded.
- **Clear roles**: Only administrators add sources, credentials and users. Everyone else browses packages and installs with their own token.

## Ecosystems: a truly universal home for all your packages

- **Composer (PHP)**, available: Composer v2 metadata protocol; Packagist and any Composer repository; GitHub, GitLab and git sources.
- **npm (JavaScript)**, next: the next ecosystem on the platform, on the same sources, credentials and access control.
- **More to follow**, planned: more languages and protocols will follow npm. [Tell us which ones your team needs.](mailto:team@haymon.ai?subject=haymon%20early%20access)

## Architecture: many sources in, one endpoint out

Sources (public registries, git repositories with a GitLab token or SSH key, and archives hosted in haymon) feed one private registry endpoint, which serves developer machines, CI pipelines and production deploys.

- **Every release, one name**: When a fork continues where the public registry stops, your clients see the releases from both under the same package name.
- **Priority settles ties**: When two sources offer the same release, the higher-priority source supplies it.
- **Outages don't empty it**: A source that's down keeps every release it already supplied, and your builds keep installing them.

## Frequently asked questions

### What is haymon?

A private package registry you run yourself. It mirrors the packages you choose from public and private sources, and serves only those to your developers, CI and AI agents.

### Which sources can it mirror?

Any Composer repository such as packagist.org, git remotes on GitHub, GitLab or anywhere else, inline package definitions, and archives you host in haymon itself.

### How do developers and CI authenticate?

Each user has one Composer token, used with http-basic (username and token) or as a Bearer token. Users can regenerate their own token at any time.

### What does it take to run?

One binary and a storage directory. The database is SQLite, the web interface is built in, and background jobs run in the same process. Configuration is environment variables or a .env file.

### Does it download every archive up front?

No. An archive is built or fetched the first time a client asks for it, then served from disk. The first install of a new version waits for that build; every one after it doesn't.

### How do I get it?

haymon is in early access. [Request access](mailto:team@haymon.ai?subject=haymon%20early%20access) and we'll get you set up.

## Take control of your supply chain

haymon is in early access, starting with Composer. Tell us about your team and which ecosystems you need next: [team@haymon.ai](mailto:team@haymon.ai?subject=haymon%20early%20access).
