# @rlch/lavish

An **annotation-only HTML review surface for the [cmux](https://cmux.com) workflow.**

Generate a rich HTML artifact, open it with `lavish`, and the user reviews it in the
browser — clicking elements to **queue annotations** that come straight back to the agent
via `lavish poll`. There is **no in-browser conversation**: you talk to the user directly
in cmux, so the editor is just a queue + a Send button.

Themed to **Catppuccin Mocha** (Base `#1e1e2e` background, Mauve accent) to sit cohesively
inside a cmux/Ghostty Mocha terminal.

## What's different from upstream

This is a fork of [`lavish-axi`](https://github.com/kunchenguid/lavish-axi) (Kun Chen, MIT),
stripped down for a single-user, agent-direct workflow:

- **No conversation panel** — the right-hand chat, agent replies, and presence spinner are gone.
- **Floating dock** — queued annotation pills + a split Send / "Send & end" button float
  bottom-right over a full-height artifact; a "Sent ✓" toast confirms each submit.
- **No top bar** — just the Annotate toggle and the ⋮ menu float top-right.
- **Catppuccin Mocha** chrome and injected annotation styles, on `--ctp-*` design tokens.
- **No telemetry, no release pipeline, no marketing** — owned and private.

## Usage

```sh
lavish <file.html>          # open / resume a review session in the browser
lavish poll <file.html>     # long-poll for queued annotations + layout warnings
lavish end <file.html>      # end the session
lavish stop                 # shut down the background server
lavish playbook [id]        # focused artifact guidance (diagram, table, plan, ...)
lavish design               # design-system router + CDN snippets
```

Artifacts default to `.lavish/<name>.html` in the working directory.

## Install (local, global)

```sh
npm i -g .       # installs the `lavish` command from this checkout
```

Not published to npm (`private`). Rebuild + reinstall after edits:

```sh
npm run build && npm i -g .
```

## Develop

```sh
npm run check    # build + lint + format:check + typecheck + test
node bin/lavish.js <file.html>   # run from source without installing
```

## Credit

Forked from [`lavish-axi`](https://github.com/kunchenguid/lavish-axi) by Kun Chen, MIT-licensed.
This fork retains the MIT license.
