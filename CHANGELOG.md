# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.16.3] - 2020-12-29
### Added 
- Setting to enable correct behavior for the multi-language search

## [0.16.2] - 2020-12-03
### Fixed
- Removes comma in slugify function

## [0.16.1] - 2020-07-16
### Fixed
- Bumps version

## [0.16.0] - 2020-06-16
### Fixed
- Deletes previous routes, before updatnig route

## [0.15.2] - 2020-05-28

## [0.15.1] - 2020-05-27
### Fixed
- Saves origin with complete app name and version
- Fixes subcategory deeper than 3 bug

## [0.15.0] - 2020-05-20

## [0.14.4] - 2020-05-07
### Fixed
- Throws 404 error when tenant is not found

## [0.14.3] - 2020-05-06
### Fixed
- Wrong map for subcategories

## [0.14.2] - 2020-04-17
### Changed
- Removes cache from messages so we are always fresh

## [0.14.1] - 2020-04-16
### Removed
- Unecessary event handlers removed

## [0.14.0] - 2020-04-16
### Changed
- Listens to events raised by catalog-graphql

### Fixed
- translate before lowering the string, so product link are translated correctly

## [0.13.1] - 2020-04-14
### Fixed 
- Fixes filte bindings by sales channel

## [0.13.0] - 2020-04-13
### Added
- Translates the product,brand and category before saving internals

## [0.12.1] - 2020-04-13
### Fixed
- Stops going up the category tree

## [0.12.0] - 2020-04-08
### Addded
- How to test added in documentation along with curls

### Changed
- Adds new save pipeline so we can console.log whenever saving internals when linked. This will provide an easier testing

### Removed
- Reverse index for internal routes

### Fixed
- Removes unecessary IO since now every accounts has a tenant

## [0.11.0] - 2020-04-03

## [0.10.1] - 2020-04-03

## [0.10.0] - 2020-04-03
### Changed
- Runs vtex setup and solves the incoming issues

## [0.9.4] - 2020-04-01
### Fixed
- Correctly returns a internal in getInternal query

## [0.9.3] - 2020-03-25
### Fixed
- Removes messages middleware

## [0.9.2] - 2020-03-24

## [0.9.1] - 2020-03-18
### Fixed
- Changes event sender

## [0.9.0] - 2020-03-03
### Added
- Saves inactive categories and brands as notFound

## [0.8.2] - 2020-03-02
### Fixed
- Set default indexed canonical searches to 0
- Fix pageType resolution

## [0.8.1] - 2020-02-14
### Fixed
- Increases redirect ttl to one year
- Adds origin field to saved routes

## [0.8.0] - 2020-02-11
### Added
- Saves reverse index, from id to url and saves redirect in case of change in route

## [0.7.1] - 2020-02-11
### Fixed
- Upgrades to node 6.x
- Improve clients configurations
- Use correct slugify

## [0.7.0] - 2020-02-11
### Added
- Middleware to control simultaneous requests
- Join categories requests

## [0.6.3] - 2020-02-07
### Fixed
- Do not set TTL to saved internal routes

## [0.6.2] - 2020-02-05
### Fixed
- Saves categories routes with correct i

## [0.6.1] - 2020-02-05
### Fixed
- Saves all routes from the whole category tree

## [0.6.0] - 2020-02-04
### Added
- Saves routes with correct bindings

## [0.5.0] - 2020-01-30
### Added
- Save routes in rewriter 

## [0.4.1] - 2020-01-24
### Fixed
- Runs vtex setup and fixed eslint errors

## [0.4.0] - 2020-01-24
### Added
- Add settings with number of search urls to be indexed

## [0.3.0] - 2020-01-08

## [0.2.0] - 2019-11-13

## [0.1.3] - 2019-10-22

## [0.1.2] - 2019-10-22

## [0.1.1] - 2019-10-22

## [0.0.3] - 2019-04-26

## [0.0.2] - 2019-04-26

### Changed
- Using new IOClient

## [0.0.1] - 2019-03-29

### Added
- Initial example
